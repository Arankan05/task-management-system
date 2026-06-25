const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { ACCESS_COOKIE } = require("../utils/authCookie");

const socketAuth = (socket, next) => {
  try {
    // 1. Try to read token from cookies
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    let token = cookies[ACCESS_COOKIE];

    // 2. Fallback to handshake auth payload (e.g. from react-socket context)
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }

    // 3. Fallback to query params or Authorization headers
    if (!token && socket.handshake.headers?.authorization) {
      const parts = socket.handshake.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error("UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (error) {
    return next(new Error("UNAUTHORIZED"));
  }
};

module.exports = socketAuth;
