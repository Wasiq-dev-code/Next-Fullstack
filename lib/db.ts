import mongoose from "mongoose";

// First, get MongoDB URL from environment variables
const MONGODB_URI = process.env.MONGODB_URL!

if(!MONGODB_URI) throw new Error("Please define mongo_url in env variables");


// Check if we already have a cached connection
let cached = global.mongoose

// If no cache exists, initialize it
if(!cached) {
  cached = global.mongoose = {
    conn: null,      // Active connection
    promise: null    // Promise of pending connection
  }
}

export async function connectToDatabase() {
  // If we already have an active connection, return it
  if(cached.conn) return cached.conn
  

  // If no connection is being established yet
  if(!cached.promise){
    mongoose.connect(MONGODB_URI)
      .then(() => mongoose.connection)
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise
  } catch (error) {
    // If connection fails, clear the promise so we can try again
    cached.promise = null
    throw error
  }

  return cached.conn
}