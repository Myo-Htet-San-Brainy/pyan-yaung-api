//packages
const express = require("express");
const router = express.Router();

//imports
const authorize = require("../middleware/authorization");
const {
  currentUserProducts,
  createProduct,
  getProducts,
  getSingleProduct,
  deleteSingleProduct,
} = require("../controllers/productController");

router.post("/", authorize, createProduct);
router.get("/", getProducts);
router.get("/current-user-products", authorize, currentUserProducts);
router.get("/:id", getSingleProduct);
router.delete("/:id", authorize, deleteSingleProduct); //need to have if deleting their own products

module.exports = router;
