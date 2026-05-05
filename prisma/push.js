const fs = require('fs');
const { execSync } = require('child_process');

try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let directUrl = '';
  const lines = envFile.split('\n');
  for (const line of lines) {
    if (line.startsWith('DIRECT_URL=')) {
      directUrl = line.split('=')[1].replace(/["']/g, '').trim();
      break;
    }
  }

  if (directUrl) {
    console.log("Running Prisma push with direct URL...");
    execSync(`npx prisma db push --accept-data-loss --url="${directUrl}"`, { stdio: 'inherit' });
  } else {
    console.log("DIRECT_URL not found in .env.local");
  }
} catch (e) {
  console.error("Script failed:", e.message);
}
