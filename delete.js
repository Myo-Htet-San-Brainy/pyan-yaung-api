require("dotenv").config();

const Job = require("./models/userModel");
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
