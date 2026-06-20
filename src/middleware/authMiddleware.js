const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response");
const { getTokenFromRequest } = require("../utils/authCookie");

const authMiddleware = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return errorResponse(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
