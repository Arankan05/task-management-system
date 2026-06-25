const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const DEV_LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === CLIENT_URL) return true;
  if (process.env.NODE_ENV !== "production" && DEV_LOCALHOST_ORIGIN.test(origin)) {
    return true;
  }
  return ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"].includes(
    origin
  );
}

function corsOrigin(origin, callback) {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}

module.exports = {
  CLIENT_URL,
  corsOrigin,
  allowedSocketOrigins: (origin, callback) => corsOrigin(origin, callback),
};
