const { errorResponse } = require("../utils/response");

const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, "Access denied", 403);
        }

        next();
    };
};

module.exports = roleMiddleware;
