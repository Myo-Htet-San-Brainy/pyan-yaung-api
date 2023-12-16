//packages
const express = require("express");
const router = express.Router();

//imports
const authorize = require("../middleware/authorization");
const { productOwn } = require("../middleware/own");
const {
  currentUserProducts,
  createProduct,
  getProducts,
  getSingleProduct,
  deleteSingleProduct,
  uploadProductImage,
} = require("../controllers/productController");

router.post("/", authorize, createProduct);
router.get("/", getProducts);
router.post("/upload-product-image", authorize, uploadProductImage);
router.get("/current-user-products", authorize, currentUserProducts);
router.get("/:id", getSingleProduct);
router.delete("/:id", [authorize, productOwn], deleteSingleProduct);

module.exports = router;
