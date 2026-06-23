const validator = require("validator");
const { errorResponse } = require("../utils/response");

const VALID_USER_ROLES = ["ADMINISTRATOR", "PROJECT_MANAGER", "COLLABORATOR"];

const validateAdminUser = (req, res, next) => {
  const { name, email, role } = req.body;

  if (!name || validator.isEmpty(String(name).trim())) {
    return errorResponse(res, "Name is required", 400);
  }

  if (!email || !validator.isEmail(String(email).trim())) {
    return errorResponse(res, "A valid email is required", 400);
  }

  if (!role || !VALID_USER_ROLES.includes(String(role).trim().toUpperCase())) {
    return errorResponse(
      res,
      "Role is required and must be Administrator, Project Manager, or Collaborator",
      400
    );
  }

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();
  req.body.role = String(role).trim().toUpperCase();

  return next();
};

module.exports = validateAdminUser;
