const mongoose = require('mongoose');

async function check() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orbit';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log('[DB CHECK] Connected to MongoDB at:', uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('[DB CHECK] Collections:', collections.map(c => c.name));
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
    
    if (collections.some(c => c.name === 'subliminals')) {
      const ytCount = await db.collection('subliminals').countDocuments({
        $or: [
          { 'source.platform': 'youtube' },
          { 'source.videoId': { $exists: true } },
          { id: { $regex: '^yt-' } }
        ]
      });
      console.log('[DB CHECK] Old YouTube Subliminal records matching filter in MongoDB:', ytCount);
    }
  } catch (err) {
    console.log('[DB CHECK] MongoDB is not running locally:', err.message);
    console.log('[DB CHECK] Application operates in resilient in-memory mode.');
  } finally {
    await mongoose.disconnect();
  }
}

check();
