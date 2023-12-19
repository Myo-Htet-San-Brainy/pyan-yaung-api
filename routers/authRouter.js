//packages
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
});

//imports
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerificationEmailAgain,
  isUserLoggedIn,
} = require("../controllers/authController");
const authorizeUser = require("../middleware/authorization");

router.post("/register", register);
router.post("/send-verification-email-again", sendVerificationEmailAgain);
router.post("/login", rateLimiter, login);
router.delete("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
router.get("/is-user-logged-in", authorizeUser, isUserLoggedIn);

module.exports = router;
