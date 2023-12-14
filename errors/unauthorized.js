const { StatusCodes } = require("http-status-codes");

class unauthorized extends Error {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = unauthorized;
