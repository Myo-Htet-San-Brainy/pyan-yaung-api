const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide product category."],
    },
    image: {
      type: String,
      required: [true, "Please provide product image."],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price."],
    },
    isNego: {
      type: Boolean,
      required: [true, "Please provide if negotiable."],
    },
    lineId: {
      type: String,
      required: [true, "Please provide line id for contact info."],
    },
    phNo: {
      type: String,
      required: [true, "Please provide phone number for contact info."],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide product creator."],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
