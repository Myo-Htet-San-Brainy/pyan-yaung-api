const User = require("../models/userModel");
const RefreshToken = require("../models/refreshTokenModel");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const createHash = require("../utils/createHash");
const sendVerificationEmail = require("../utils/emails/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/emails/sendPasswordResetEmail");
const { attachCookiesToResponse } = require("../utils/jwt");
const createUserPayload = require("../utils/createUserPayload");
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
  const origin = "https://21dayshabitreminder.netlify.app";

  await sendVerificationEmail(
    user.username,
    user.email,
    user.verificationToken,
    origin
  );
  // send verification token back only while testing in postman!!!
  res.status(StatusCodes.CREATED).json({
    message:
      "Success! Please check your email inbox for email verification link",
    verificationToken,
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
  const origin = "http://localhost:3000";
  await sendVerificationEmail(
    user.username,
    user.email,
    user.verificationToken,
    origin
  );
  res.status(StatusCodes.OK).json({
    message:
      "Success! Please check your email inbox for email verification link",
    verificationToken,
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
    throw new customError.Unauthenticated("Please verify your email");
  }
  //All the code below is for authorization
  const tokenUser = createUserPayload(user);

  // create refresh token
  let refreshToken = "";
  // check for existing token
  const existingToken = await RefreshToken.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    //isValid check is here just because if sites admin become sus of a user they can change this 'isValid' to false and that one user wouldn't be able to login forever
    if (!isValid) {
      throw new customError.Unauthenticated("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse(res, tokenUser, refreshToken);
    res.status(StatusCodes.OK).json({ message: "User logged in" });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await RefreshToken.create(userToken);

  attachCookiesToResponse(res, tokenUser, refreshToken);

  res.status(StatusCodes.OK).json({ message: "User logged in" });
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
  const { refreshToken, accessToken } = req.signedCookies;
  if (accessToken) {
    res.status(StatusCodes.OK).json({ isUserLoggedIn: true });
    return;
  }
  if (refreshToken) {
    res.status(StatusCodes.OK).json({ isUserLoggedIn: true });
    return;
  }
  res.status(StatusCodes.OK).json({ isUserLoggedIn: false });
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
