//packages
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

//imports
const connectDB = require("./db/connectDb");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authorize = require("./middleware/authorization");

//router imports
const authRouter = require("./routers/authRouter");
const productRouter = require("./routers/productRouter");

//configs
require("./config/cloudinaryConfig");

//middleware
app.use(morgan("tiny"));
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: "https://pyan-yaung.netlify.app",
  })
);
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//routes
app.get("/", authorize, async (req, res) => {
  res.send("hello world!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);

//lower order middleware
app.use(notFound);
app.use(errorHandler);

//start the app
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
