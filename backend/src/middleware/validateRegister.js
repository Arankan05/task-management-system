const validator = require("validator");
const { errorResponse } = require("../utils/response");
const { validatePassword } = require("../utils/passwordPolicy");

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || validator.isEmpty(name.trim())) {
        return errorResponse(res, "Name is required", 400);
    }

    if (!email || !validator.isEmail(email)) {
        return errorResponse(res, "Invalid email address", 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        return errorResponse(res, passwordCheck.message, 400);
    }

    next();
};

module.exports = validateRegister;
