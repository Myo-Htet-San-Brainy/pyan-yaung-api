//packages
var cloudinary = require("cloudinary").v2;
const { StatusCodes } = require("http-status-codes");

//imports
const Product = require("../models/productModel");

const currentUserProducts = async (req, res) => {
  const { userId } = req.user;
  const products = await Product.find({ userId });
  res.status(StatusCodes.OK).json({
    message: "Success",
    data: products,
  });
};

const getProducts = async (req, res) => {
  const { category } = req.query;
  const filterObject = {};
  //category filter
  if (category && category !== "All") {
    filterObject.category = category;
  }
  const products = await Product.find(filterObject);
  res.status(StatusCodes.OK).json({ data: products });
};

const createProduct = async (req, res) => {
  const { userId } = req.user;
  const product = {
    ...req.body,
    userId,
  };
  await Product.create(product);
  res.status(StatusCodes.CREATED).send("Product created");
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findById(productId);
  res.status(StatusCodes.OK).json({ data: product });
};

const deleteSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  await Product.findByIdAndDelete(productId);
  res.status(StatusCodes.OK).send("Product deleted");
};

const uploadProductImage = async (req, res) => {
  const dataAboutUpload = await cloudinary.uploader.upload(
    req.files.car.tempFilePath,
    {
      use_filename: true,
      folder: "pyan-pyaung",
    }
  );
  res.status(StatusCodes.OK).json({ data: dataAboutUpload.secure_url });
};

module.exports = {
  currentUserProducts,
  createProduct,
  getProducts,
  getSingleProduct,
  deleteSingleProduct,
  uploadProductImage,
};
