const { StatusCodes } = require("http-status-codes");

class unauthenticated extends Error {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = unauthenticated;
