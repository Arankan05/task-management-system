const validator = require("validator");
const { errorResponse } = require("../utils/response");

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || validator.isEmpty(name.trim())) {
        return errorResponse(res, "Name is required", 400);
    }

    if (!email || !validator.isEmail(email)) {
        return errorResponse(res, "Invalid email address", 400);
    }

    if (!password || !validator.isLength(password, { min: 6 })) {
        return errorResponse(res, "Password must be at least 6 characters long", 400);
    }

    next();
};

module.exports = validateRegister;
