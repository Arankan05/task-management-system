const { errorResponse } = require("../utils/response");

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(
      res,
      "Authentication required",
      401,
      "A valid session token is required to access this resource"
    );
  }

  if (!roles.includes(req.user.role)) {
    return errorResponse(
      res,
      "Access denied",
      403,
      "Your account role is not permitted to perform this action"
    );
  }

  return next();
};

module.exports = roleMiddleware;
