const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { successResponse, errorResponse } = require("../utils/response");
const { setAuthCookies, clearAuthCookies, getRefreshTokenFromRequest, getTokenFromRequest } = require("../utils/authCookie");
const {
    signAccessToken,
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserRefreshTokens,
    rotateRefreshToken,
} = require("../services/authTokenService");
const { sendPasswordResetOtp, OTP_EXPIRY_MINUTES } = require("../services/emailService");
const { validatePassword } = require("../utils/passwordPolicy");

const OTP_MAX_REQUESTS = 3;
const OTP_WINDOW_MS = 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY = "15m";

const GENERIC_FORGOT_MSG =
    "If that email is registered, we sent a verification code.";

const generateOtp = () =>
    String(Math.floor(100000 + Math.random() * 900000));

const clearResetOtp = {
    resetOtp: null,
    resetOtpExpires: null,
    resetOtpSendCount: 0,
    resetOtpWindowStart: null,
};

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    mustResetPassword: true,
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
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
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

        if (!user.isActive) {
            return errorResponse(res, "Account deactivated", 403, "Your account has been deactivated. Contact an administrator.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return errorResponse(res, "Invalid credentials", 400);
        }

        const accessToken = signAccessToken(user);
        const refreshToken = await createRefreshToken(user.id);

        const { password: _, ...safeUser } = user;

        setAuthCookies(res, accessToken, refreshToken);

        return successResponse(res, "Login successful", {
            user: safeUser,
            mustResetPassword: user.mustResetPassword,
        });
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const logoutUser = async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    } else {
        const accessToken = getTokenFromRequest(req);
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                if (decoded?.id) {
                    await revokeAllUserRefreshTokens(decoded.id);
                }
            } catch {
                // access token may be expired; cookies will still be cleared
            }
        }
    }

    clearAuthCookies(res);
    return successResponse(res, "Logged out successfully");
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);

        if (!refreshToken) {
            clearAuthCookies(res);
            return errorResponse(res, "Refresh token required", 401);
        }

        const record = await verifyRefreshToken(refreshToken);

        if (!record?.user) {
            clearAuthCookies(res);
            return errorResponse(res, "Invalid or expired refresh token", 401);
        }

        const accessToken = signAccessToken(record.user);
        const newRefreshToken = await rotateRefreshToken(refreshToken, record.userId);

        setAuthCookies(res, accessToken, newRefreshToken);

        return successResponse(res, "Token refreshed successfully");
    } catch (error) {
        console.error(error);
        clearAuthCookies(res);
        return errorResponse(res, "Failed to refresh token", 500);
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

const forgotPassword = async (req, res) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();

        if (!email || !validator.isEmail(email)) {
            return errorResponse(res, "Please enter a valid email address", 400);
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            const now = new Date();
            let sendCount = user.resetOtpSendCount || 0;
            let windowStart = user.resetOtpWindowStart;

            if (
                !windowStart ||
                now.getTime() - new Date(windowStart).getTime() > OTP_WINDOW_MS
            ) {
                sendCount = 0;
                windowStart = now;
            }

            if (sendCount >= OTP_MAX_REQUESTS) {
                return errorResponse(
                    res,
                    "Too many OTP requests. Please try again in an hour.",
                    429
                );
            }

            const otp = generateOtp();
            const hashedOtp = await bcrypt.hash(otp, 10);
            const expiresAt = new Date(
                now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000
            );

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetOtp: hashedOtp,
                    resetOtpExpires: expiresAt,
                    resetOtpSendCount: sendCount + 1,
                    resetOtpWindowStart: windowStart,
                },
            });

            try {
                await sendPasswordResetOtp(user.email, user.name, otp);
            } catch (mailErr) {
                console.error("Failed to send OTP email:", mailErr);
                await prisma.user.update({
                    where: { id: user.id },
                    data: clearResetOtp,
                });
                return errorResponse(
                    res,
                    "Could not send verification email. Please try again later.",
                    500
                );
            }
        }

        return successResponse(res, GENERIC_FORGOT_MSG, { email });
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const verifyResetOtp = async (req, res) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const otp = (req.body.otp || "").trim();

        if (!email || !validator.isEmail(email)) {
            return errorResponse(res, "Please enter a valid email address", 400);
        }

        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            return errorResponse(res, "Please enter a valid 6-digit code", 400);
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (
            !user ||
            !user.resetOtp ||
            !user.resetOtpExpires ||
            new Date() > user.resetOtpExpires
        ) {
            return errorResponse(res, "Invalid or expired verification code", 400);
        }

        const isValid = await bcrypt.compare(otp, user.resetOtp);

        if (!isValid) {
            return errorResponse(res, "Invalid or expired verification code", 400);
        }

        const resetToken = jwt.sign(
            { id: user.id, email: user.email, purpose: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: RESET_TOKEN_EXPIRY }
        );

        return successResponse(res, "Verification successful", { resetToken });
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken) {
            return errorResponse(res, "Reset token is required", 400);
        }

        if (!newPassword) {
            return errorResponse(res, "New password is required", 400);
        }

        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.valid) {
            return errorResponse(res, passwordCheck.message, 400);
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch {
            return errorResponse(res, "Invalid or expired reset session", 400);
        }

        if (decoded.purpose !== "password-reset") {
            return errorResponse(res, "Invalid reset token", 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustResetPassword: false,
                ...clearResetOtp,
            },
        });

        return successResponse(
            res,
            "Password reset successfully. You can now sign in."
        );
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

const forceResetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return errorResponse(res, "New password and confirmation are required", 400);
        }

        if (newPassword !== confirmPassword) {
            return errorResponse(res, "Passwords do not match", 400);
        }

        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.valid) {
            return errorResponse(res, passwordCheck.message, 400);
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        if (!user.mustResetPassword) {
            return errorResponse(res, "Password reset is not required for this account", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustResetPassword: false,
            },
            select: USER_SELECT,
        });

        return successResponse(res, "Password updated successfully", updated);
    } catch (error) {
        console.error(error);
        return errorResponse(res, "Server Error", 500);
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getProfile,
    updateProfile,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    forceResetPassword,
};
