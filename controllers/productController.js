const { StatusCodes } = require("http-status-codes");

const currentUserProducts = async (req, res) => {
  const { userId } = req.user;
  res.status(StatusCodes.OK).json({
    message: "Success",
    data: {},
  });
};

const getProducts = async (req, res) => {
  res.send("Products");
};

const createProduct = async (req, res) => {
  res.send("created product");
};

const getSingleProduct = async (req, res) => {
  res.send("Single Product");
};

const deleteSingleProduct = async (req, res) => {
  res.send("deleted");
};

module.exports = {
  currentUserProducts,
  createProduct,
  getProducts,
  getSingleProduct,
  deleteSingleProduct,
};
