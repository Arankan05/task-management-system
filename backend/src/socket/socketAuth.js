const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { ACCESS_COOKIE } = require("../utils/authCookie");

const socketAuth = (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies[ACCESS_COOKIE];

    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch {
    return next(new Error("UNAUTHORIZED"));
  }
};

module.exports = socketAuth;
