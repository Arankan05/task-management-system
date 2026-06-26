const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getSession,
    getProfile,
    updateProfile,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    forceResetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const validateRegister = require(
    "../middleware/validateRegister"
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input parameters or email already registered
 *       500:
 *         description: Internal server error
 */
router.post(
    "/register",
    validateRegister,
    registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user credentials and sets Access/Refresh tokens in HTTP-Only cookies.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Account deactivated
 *       500:
 *         description: Internal server error
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get current active session user
 *     description: Checks the Access Token or rotates the Refresh Token cookie to return the active authenticated user profile.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Active session returned (user data or null)
 *       500:
 *         description: Internal server error
 */
router.get("/session", getSession);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses the current Refresh Token cookie to rotate tokens and reissue a new Access Token.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
router.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Revokes the active Refresh Token record and clears authentication cookies.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logoutUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     description: Sends a 6-digit verification code to the registered email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP verification code sent
 *       400:
 *         description: Invalid email format
 *       429:
 *         description: Too many OTP requests
 *       500:
 *         description: Internal server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     description: Confirms the 6-digit code is valid and returns a reset session token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code verified, reset token returned
 *       400:
 *         description: Invalid or expired code
 *       500:
 *         description: Internal server error
 */
router.post("/verify-reset-otp", verifyResetOtp);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Submits the reset token and new password to complete recovery.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: NewPass1234!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token, or weak password
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/force-reset-password:
 *   post:
 *     summary: Force password reset
 *     description: Replaces temporary password on first login. Requires authorization token.
 *     tags: [Authentication]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Passwords do not match or fail validation criteria
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/force-reset-password", authMiddleware, forceResetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     description: Returns detailed profile parameters for the authenticated user.
 *     tags: [Authentication]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/profile", authMiddleware, getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Modifies personal details (name, profile photo, dob, contact number, address).
 *     tags: [Authentication]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               profilePhoto:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Full name required or file size validation fail
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;