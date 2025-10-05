import mongoose from "mongoose";

// Support either MONGODB_URI (common name) or MONGO_URI (existing project)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI or MONGO_URI environment variable in .env.local"
  );
}

let cached = global.mongoose; 
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
    
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDB;
