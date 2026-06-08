const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/response");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse(res, "User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return successResponse(
            res,
            "User registered successfully",
            user,
            201
        );
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse(res, "Invalid credentials", 400);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return errorResponse(res, "Invalid credentials", 400);
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return successResponse(
            res,
            "Login successful",
            {
                token,
                user,
            }
        );
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
