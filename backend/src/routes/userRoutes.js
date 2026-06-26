const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ensurePasswordChanged = require("../middleware/ensurePasswordChanged");
const userService = require("../services/userService");
const { successResponse, errorResponse } = require("../utils/response");

router.use(auth);
router.use(ensurePasswordChanged);

// Middleware to ensure the user has global ADMINISTRATOR privileges
const requireSystemAdmin = (req, res, next) => {
  if (req.user?.role === "ADMINISTRATOR") {
    return next();
  }
  return errorResponse(res, "Access denied. Administrator privileges required.", 403);
};

// GET / is accessible to all authenticated users to list active users for assignment
router.get("/", async (req, res) => {
  try {
    const { search, role, status } = req.query;
    // Standard users can only list active users
    const queryStatus = req.user?.role === "ADMINISTRATOR" ? status : "active";
    const users = await userService.listAllUsers({ search, role, status: queryStatus });
    return successResponse(res, "All users fetched successfully", users);
  } catch (error) {
    console.error("listAllUsers error:", error);
    return errorResponse(res, "Failed to fetch users", 500);
  }
});

// Secure all subsequent modifying routes with requireSystemAdmin
router.use(requireSystemAdmin);

router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !name.trim()) return errorResponse(res, "Name is required", 400);
    if (!email || !email.trim()) return errorResponse(res, "Email is required", 400);
    if (!role) return errorResponse(res, "Role is required", 400);

    const result = await userService.createGlobalUser({ name, email, role });
    return successResponse(
      res,
      result.emailSent
        ? "User created successfully and welcome email sent."
        : "User created successfully. (Email failed to send, temporary password provided).",
      result,
      201
    );
  } catch (error) {
    console.error("createGlobalUser error:", error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to create user", status);
  }
});

router.patch("/:userId", async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await userService.updateGlobalUser(req.params.userId, { name, role });
    return successResponse(res, "User updated successfully", user);
  } catch (error) {
    console.error("updateGlobalUser error:", error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to update user", status);
  }
});

router.patch("/:userId/deactivate", async (req, res) => {
  try {
    const user = await userService.setGlobalUserActive(req.params.userId, false, req.user.id);
    return successResponse(res, "User deactivated successfully", user);
  } catch (error) {
    console.error("deactivateGlobalUser error:", error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to deactivate user", status);
  }
});

router.patch("/:userId/activate", async (req, res) => {
  try {
    const user = await userService.setGlobalUserActive(req.params.userId, true, req.user.id);
    return successResponse(res, "User activated successfully", user);
  } catch (error) {
    console.error("activateGlobalUser error:", error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to activate user", status);
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const user = await userService.deleteGlobalUser(req.params.userId, req.user.id);
    return successResponse(res, "User deleted successfully", user);
  } catch (error) {
    console.error("deleteGlobalUser error:", error);
    const status = error.status || 500;
    return errorResponse(res, error.message || "Failed to delete user", status);
  }
});

module.exports = router;
