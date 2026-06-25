const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");
const { getTokenFromRequest } = require("../utils/authCookie");

const authMiddleware = (req, res, next) => {
  const token = getTokenFromRequest(req);

  console.log("===== AUTH DEBUG =====");
  console.log("Request URL:", req.originalUrl);
  console.log("Cookie Header:", req.headers.cookie);
  console.log("Parsed Cookies:", req.cookies);
  console.log("Token:", token);
  console.log("======================");

  if (!token) {
    return errorResponse(
      res,
      "Authentication required",
      401,
      "A valid session token is required to access this resource"
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        "Session expired",
        401,
        "Please sign in again or refresh your session"
      );
    }

    return errorResponse(
      res,
      "Invalid token",
      401,
      "The provided authentication token is invalid or has been revoked"
    );
  }
};

module.exports = authMiddleware;
