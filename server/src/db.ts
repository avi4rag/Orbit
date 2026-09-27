import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://anurags125_db_user:Anurag0106@cluster0.nr3jcwl.mongodb.net/Orbit';
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log('[Orbit DB] Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.warn('[Orbit DB] MongoDB connection failed or not running. Operating in resilient in-memory mode for offline development.');
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
