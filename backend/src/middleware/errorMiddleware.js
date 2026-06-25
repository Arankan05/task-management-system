const { HttpError } = require("../utils/httpErrors");
const { errorResponse } = require("../utils/response");

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return errorResponse(res, err.message, err.status, err.description);
  }

  if (err.status && err.message) {
    return errorResponse(res, err.message, err.status, err.description || null);
  }

  console.error(err);
  return errorResponse(
    res,
    "Internal Server Error",
    500,
    "An unexpected error occurred while processing the request"
  );
};

module.exports = errorMiddleware;
