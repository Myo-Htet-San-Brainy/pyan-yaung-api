const customError = require("../errors");
const { isTokenValid } = require("../utils/jwt");

const authorizeUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("No token provided");
    }
    const token = authHeader.split(" ")[1];
    const payload = isTokenValid(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new customError.Unauthorized("Authorization Invalid");
  }
};

module.exports = authorizeUser;
