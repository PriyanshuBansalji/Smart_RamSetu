import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

async function main() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ramsetu-health-bridge";
  console.log("Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const collection = mongoose.connection.collection("users");
  const indexes = await collection.indexes();
  console.log("Existing indexes:", indexes.map(i => i.name));

  // Drop legacy unique index on email if present
  const emailOnlyIndex = indexes.find(i => i.key && i.key.email === 1 && Object.keys(i.key).length === 1);
  if (emailOnlyIndex) {
    console.log("Dropping legacy index:", emailOnlyIndex.name);
    await collection.dropIndex(emailOnlyIndex.name);
  } else {
    console.log("No legacy email-only index found.");
  }

  // Ensure schema indexes are in sync (creates compound {email, role} unique index)
  await User.syncIndexes();
  const newIndexes = await collection.indexes();
  console.log("Indexes after sync:", newIndexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique })));

  await mongoose.disconnect();
  console.log("Done fixing user indexes.");
}

main().catch(err => {
  console.error("Index fix failed:", err);
  process.exit(1);
});
