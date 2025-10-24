import dotenv from "dotenv";
import mongoose from "mongoose";
import Donor from "../models/Donor.js";

dotenv.config();

async function main() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ramsetu-health-bridge";
  console.log("Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const collection = mongoose.connection.collection("donors");
  const indexes = await collection.indexes();
  console.log("Existing indexes:", indexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique })));

  // Drop legacy unique index on email if present and unique
  const emailOnlyIndex = indexes.find(i => i.key && i.key.email === 1 && Object.keys(i.key).length === 1);
  if (emailOnlyIndex) {
    console.log("Dropping legacy donor email-only index:", emailOnlyIndex.name);
    try { await collection.dropIndex(emailOnlyIndex.name); } catch (err) { console.warn("Drop email index failed:", err.message); }
  } else {
    console.log("No legacy donor email-only index found.");
  }

  // Ensure schema indexes are in sync (creates unique index on userId, keeps regId unique)
  await Donor.syncIndexes();
  const newIndexes = await collection.indexes();
  console.log("Indexes after sync:", newIndexes.map(i => ({ name: i.name, key: i.key, unique: !!i.unique })));

  await mongoose.disconnect();
  console.log("Done fixing donor indexes.");
}

main().catch(err => {
  console.error("Donor index fix failed:", err);
  process.exit(1);
});
