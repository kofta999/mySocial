let io;

module.exports = {
  init: (httpServer, options) => {
    io = require("socket.io")(httpServer, options);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io is not initalized");
    }
    return io;
  },
};
