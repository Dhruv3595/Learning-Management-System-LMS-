import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectToDb = async (MongoURL) => {
  await mongoose
    .connect(MongoURL)
    .then((conn) => {
      console.log(`db connected: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log(`error in connected db: ${err}`);
    });
};

export default connectToDb;
