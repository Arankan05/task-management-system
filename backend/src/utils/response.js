const { ERROR_CODES } = require("./httpErrors");

const successResponse = (res, message, data = null, status = 200) =>
  res.status(status).json({
    success: true,
    message,
    data,
  });

const errorResponse = (res, message, status = 500, description = null) => {
  const code = ERROR_CODES[status] || "ERROR";

  return res.status(status).json({
    success: false,
    message,
    error: {
      code,
      message,
      ...(description ? { description } : {}),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
