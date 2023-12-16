const Product = require("../models/productModel");
const Error = require("../errors");

function ownFactory(model) {
  return async function own(req, res, next) {
    try {
      const item = await model.findById(req.params.id);
      if (item.userId.toString() !== req.user.userId) {
        throw new Error.Unauthorized("Not authorized to delete this product.");
      }
      next();
    } catch (error) {
      throw error;
    }
  };
}

const productOwn = ownFactory(Product);

module.exports = {
  productOwn,
};
