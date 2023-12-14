const notFound = (req, res, next) => {
  try {
    res.status(404).json({ success: false, message: "Resource Not Found" });
  } catch (error) {
    next(error);
  }
};

module.exports = notFound;
