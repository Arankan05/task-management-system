const prisma = require("../config/db");
const { errorResponse } = require("../utils/response");

const ensurePasswordChanged = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isActive: true, mustResetPassword: true },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (!user.isActive) {
      return errorResponse(res, "Account deactivated", 403, "Your account has been deactivated by an administrator");
    }

    if (user.mustResetPassword) {
      return errorResponse(
        res,
        "Password reset required",
        403,
        "You must set a new password before accessing the system"
      );
    }

    return next();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server Error", 500);
  }
};

module.exports = ensurePasswordChanged;
