const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/response");

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    profilePhoto: true,
    contactNumber: true,
    address: true,
    dateOfBirth: true,
    gender: true,
    createdAt: true,
};

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
            select: USER_SELECT,
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

        const { password: _, ...safeUser } = user;

        return successResponse(
            res,
            "Login successful",
            {
                token,
                user: safeUser,
            }
        );
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: USER_SELECT,
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(res, "Profile fetched", user);
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, profilePhoto, contactNumber, address, dateOfBirth, gender } = req.body;

        if (!name || !name.trim()) {
            return errorResponse(res, "Full name is required", 400);
        }

        if (profilePhoto && typeof profilePhoto === "string" && profilePhoto.length > 2_000_000) {
            return errorResponse(res, "Profile photo is too large", 400);
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name.trim(),
                profilePhoto: profilePhoto ?? null,
                contactNumber: contactNumber?.trim() || null,
                address: address?.trim() || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender: gender?.trim() || null,
            },
            select: USER_SELECT,
        });

        return successResponse(res, "Profile updated successfully", user);
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
};
