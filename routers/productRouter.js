//packages
const express = require("express");
const router = express.Router();

//imports
const authorize = require("../middleware/authorization");
const { currentUserProducts } = require("../controllers/productController");

router.get("/current-user-products", authorize, currentUserProducts);

module.exports = router;
