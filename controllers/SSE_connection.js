const { addClient } = require('../utils/sseClients');
const asyncWrapper = require("../middleware/asyncWrapper");

const establishAdminConnection = asyncWrapper(async (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized: No admin found" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Confirm connection event
  res.write("event: connected\n");
  res.write(`data: ${JSON.stringify({
    message: "SSE connection established",
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role,
      group: req.admin.group,
    },
  })}\n\n`);

  // Add admin to the SSE clients pool
  addClient(res, req.admin.email, req.admin.role, req.admin.group);

  // Heartbeat to keep connection alive
  const hb = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  // Handle connection close
  req.on("close", () => {
    clearInterval(hb);
    removeClient(res); // 👈 you need this function in your pool manager
  });
});

module.exports = {
  establishAdminConnection
};