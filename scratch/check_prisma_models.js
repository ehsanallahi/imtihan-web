import { db } from '../src/lib/db.js';

async function checkPrisma() {
  try {
    console.log("Checking Prisma Models...");
    console.log("Models:", Object.keys(db).filter(k => !k.startsWith('_')));
    if (db.waitlistEntry) {
      console.log("SUCCESS: WaitlistEntry model found!");
    } else {
      console.log("FAILURE: WaitlistEntry model NOT found in db object.");
    }
  } catch (error) {
    console.error("Prisma Check Error:", error);
  } finally {
    process.exit();
  }
}

checkPrisma();
