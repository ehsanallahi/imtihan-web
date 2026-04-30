import { db } from '../src/lib/db.js';

async function test() {
  try {
    console.log("Checking tables...");
    const result = await db.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables found:", result.map(t => t.table_name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.$disconnect();
  }
}

test();
