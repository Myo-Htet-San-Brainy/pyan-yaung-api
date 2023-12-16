const crypto = require("crypto");

const createHash = (passwordResetToken) =>
  crypto.createHash("md5").update(passwordResetToken).digest("hex");

module.exports = createHash;
