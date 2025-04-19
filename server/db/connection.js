const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    await mongoose
      .connect(url);
    return console.log(`Connection Successful`);
  } catch (error) {
    return console.log(error);
  }
};

module.exports = connectDB;
