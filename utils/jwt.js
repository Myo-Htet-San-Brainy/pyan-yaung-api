const jwt = require("jsonwebtoken");

const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = (res, user, refreshToken) => {
  const accessTokenJWT = createJWT(user);
  const refreshTokenPayload = { user, refreshToken };
  const refreshTokenJWT = createJWT(refreshTokenPayload);

  const oneHour = 1 * 60 * 60 * 1000;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};
// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     signed: true,
//   });
// };

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
