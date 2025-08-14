import mongoose from "mongoose";

//Function to connect to the database
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("MongoDB connection established");
    });
    await mongoose.connect(`${process.env.MONGO_URI}/chat-app`);
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    // process.exit(1); // Exit the process with failure
  }
}