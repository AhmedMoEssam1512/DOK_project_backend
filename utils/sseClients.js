// utils/sseClients.js

// Store each client with metadata { res, email, name, role, group }
const sseClients = [];

// Store past events per group so reconnecting clients can catch up
// Example: { "group1": [ { id: 12345, message: "..." }, ... ] }
const eventHistory = {};
const HISTORY_LIMIT = 50; // keep only the last 50 events per group

/**
 * Replay missed events if client sent Last-Event-ID header
 */
function replayMissedEvents(res, group, lastEventId) {
  if (!lastEventId || !eventHistory[group]) return;

  const missed = eventHistory[group].filter(ev => ev.id > lastEventId);
  missed.forEach(ev => {
    res.write(ev.message);
  });
}

/**
 * Add an admin SSE client
 */
function addAdminClient(req, res, email, name, role, group) {
  const client = { res, email, name, role, group };
  const lastEventId = req.headers["last-event-id"];

  // Send missed events if any
  replayMissedEvents(res, group, lastEventId);

  sseClients.push(client);
  return client;
}

/**
 * Add a student SSE client
 */
function addStudentClient(req, res, email, name, group) {
  const client = { res, email, name, role: "student", group };
  const lastEventId = req.headers["last-event-id"];

  // Send missed events if any
  replayMissedEvents(res, group, lastEventId);

  sseClients.push(client);
  return client;
}

/**
 * Remove a client manually (used in req.on("close"))
 */
function removeClient(res) {
  const index = sseClients.findIndex((c) => c.res === res);
  if (index !== -1) {
    sseClients.splice(index, 1);
  }
}

/**
 * Helper: store an event in history
 */
function storeEvent(group, id, message) {
  if (!eventHistory[group]) eventHistory[group] = [];
  eventHistory[group].push({ id, message });

  // Limit history size to prevent memory leaks
  if (eventHistory[group].length > HISTORY_LIMIT) {
    eventHistory[group].shift();
  }
}

/**
 * Send data only to assistants in the same group
 */
function notifyAssistants(group, payload) {
  const id = Date.now();
  const message =
    `id: ${id}\n` +
    `event: ${payload.event || "message"}\n` +
    `data: ${JSON.stringify(payload)}\n\n`;

  // Store event for replay
  storeEvent(group, id, message);

  sseClients.forEach((client) => {
    if (client.role === "assistant" && client.group === group) {
      try {
        client.res.write(message);
      } catch (err) {
        removeClient(client.res);
        client.res.end();
      }
    }
  });
}

/**
 * Send data to students (specific group or all)
 */
function notifyStudents(group, payload) {
  const id = Date.now();
  const message =
    `id: ${id}\n` +
    `event: ${payload.event || "message"}\n` +
    `data: ${JSON.stringify(payload)}\n\n`;

  // Store event for replay
  if (group === "all") {
    // store once in each group history
    Object.keys(eventHistory).forEach(g => storeEvent(g, id, message));
  } else {
    storeEvent(group, id, message);
  }

  sseClients.forEach((client) => {
    if (
      client.role === "student" &&
      (group === "all" || client.group === group)
    ) {
      try {
        client.res.write(message);
      } catch (err) {
        removeClient(client.res);
        client.res.end();
      }
    }
  });
}

module.exports = {
  addAdminClient,
  addStudentClient,
  removeClient,
  notifyAssistants,
  notifyStudents
};
