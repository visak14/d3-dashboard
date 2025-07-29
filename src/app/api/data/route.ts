import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("dashboard");
    const data = await collection.find().toArray();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch data:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST() {
 
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("dashboard");
    const data = await collection.find().toArray();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to fetch data:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  } finally {
    await client.close();
  }
}
