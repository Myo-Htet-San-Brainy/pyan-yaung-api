require("dotenv").config();
const mockData = require("./MOCK_DATA.json");
const Job = require("./models/productModel");
const connectDB = require("./db/connectDb");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Job.deleteMany({});
    console.log("Success !!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
