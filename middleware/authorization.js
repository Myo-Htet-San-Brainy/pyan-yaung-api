const customError = require("../errors");
const RefreshToken = require("../models/refreshTokenModel");
const { isTokenValid, attachCookiesToResponse } = require("../utils/jwt");

const authorizeUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const userObj = isTokenValid(accessToken);
      req.user = userObj;
      console.log("authorized with access token");
      return next();
    }
    // console.log("before validating refresh token");
    const payload = isTokenValid(refreshToken);
    console.log("authorized with refresh token");

    // console.log(payload);

    const existingToken = await RefreshToken.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new customError.Unauthorized("Authorization Invalid");
    }

    attachCookiesToResponse(res, payload.user, existingToken.refreshToken);

    req.user = payload.user;
    next();
  } catch (error) {
    throw new customError.Unauthorized("Authorization Invalid");
  }
};

// const authorizePermissions = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       throw new CustomError.UnauthorizedError(
//         "Unauthorized to access this route"
//       );
//     }
//     next();
//   };
// };

module.exports = authorizeUser;
