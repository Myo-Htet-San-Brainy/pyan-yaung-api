const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const createHash = require("../utils/createHash");
const sendVerificationEmail = require("../utils/emails/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/emails/sendPasswordResetEmail");
const { createJWT } = require("../utils/jwt");
const crypto = require("crypto");

const register = async (req, res) => {
  const { email, username, password } = req.body;

  //extra check, we already check on schema level with 'unique'
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new customError.BadRequest("Email already exists");
  }

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    username,
    email,
    password,
    verificationToken,
  });
  const origin = "http://localhost:5173";

  await sendVerificationEmail(
    user.username,
    user.email,
    user.verificationToken,
    origin
  );
  // send verification token back only while testing in postman!!!
  res.status(StatusCodes.CREATED).json({
    message:
      "Success! Before proceeding, please check your email inbox for email verification link",
  });
};

const sendVerificationEmailAgain = async (req, res) => {
  const { email } = req.body;
  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await User.findOneAndUpdate(
    { email },
    {
      verificationToken,
    },
    {
      new: true,
    }
  );
  if (!user) {
    throw new customError.BadRequest(
      "There is no account with such email. Please sign up(register) instead."
    );
  }
  if (user.isVerified) {
    throw new customError.BadRequest(
      "This email address is already verified. Try to log in."
    );
  }
  const origin = "http://localhost:5173";

  await sendVerificationEmail(
    user.username,
    user.email,
    user.verificationToken,
    origin
  );
  res.status(StatusCodes.OK).json({
    message:
      "Success! Please check your email inbox for email verification link",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new customError.Unauthenticated("Verification Failed");
  }

  if (user.verificationToken !== verificationToken) {
    throw new customError.Unauthenticated("Verification Failed");
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ message: "Email Verified" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  //authentication
  if (!email || !password) {
    throw new customError.BadRequest("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new customError.Unauthenticated("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new customError.Unauthenticated("Invalid Credentials");
  }

  if (!user.isVerified) {
    throw new customError.Unauthorized(
      "Please verify email first before logging in."
    );
  }

  //create jwt to send
  const jwt = createJWT({ userId: user._id });

  res.status(StatusCodes.OK).json({ message: "User logged in", jwt });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new customError.BadRequest("Please provide valid email");
  }

  const user = await User.findOne({ email });
  //For production, put pswToken back in if block below
  const passwordToken = crypto.randomBytes(70).toString("hex");
  if (user) {
    // send email
    const origin = "http://localhost:3000";
    await sendResetPasswordEmail(
      user.username,
      user.email,
      passwordToken,
      origin
    );

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res.status(StatusCodes.OK).json({
    message: "Please check your email inbox for password reset link",
    passwordToken,
  });
};
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new customError.BadRequest("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ message: "Password reset successful" });
};

const logout = async (req, res) => {
  //removing cookies
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ message: "user logged out!" });
};

const isUserLoggedIn = async (req, res) => {
  res.status(StatusCodes.OK).json({ data: req.user });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerificationEmailAgain,
  isUserLoggedIn,
};
