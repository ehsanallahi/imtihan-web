const { db } = require('./src/lib/db');

async function test() {
  try {
    const count = await db.aiUsage.count();
    console.log("AiUsage count:", count);
  } catch (err) {
    console.error("Error accessing AiUsage:", err);
  }
  process.exit(0);
}

test();
