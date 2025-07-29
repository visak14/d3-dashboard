import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("dashboard");

    await collection.deleteMany({});

    const dataPath = path.join(__dirname, "../public/jsondata.json");
    const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    await collection.insertMany(jsonData);

    console.log(" Database seeded successfully!");
  } catch (err) {
    console.error(" Error seeding database:", err);
  } finally {
    await client.close();
  }
}

seed();
