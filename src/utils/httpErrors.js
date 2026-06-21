const ERROR_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "INTERNAL_SERVER_ERROR",
};

class HttpError extends Error {
  constructor(status, message, description = null) {
    super(message);
    this.status = status;
    this.description = description;
    this.code = ERROR_CODES[status] || "ERROR";
  }
}

const unauthorized = (message = "Authentication required", description = null) =>
  new HttpError(401, message, description);

const forbidden = (message = "Access denied", description = null) =>
  new HttpError(403, message, description);

module.exports = {
  ERROR_CODES,
  HttpError,
  unauthorized,
  forbidden,
};
