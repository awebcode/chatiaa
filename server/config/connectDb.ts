import mongoose, { type MongooseError } from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB!);
    console.log("Db connected!");
  } catch (error) {
    let err = error as MongooseError;
    console.log("Db Connection Problem!", err.message);
  }
};

export default connectDb;
