require('dotenv').config({ path: '.env.local' });
const { newEnforcer, Model } = require('casbin');
const { PrismaAdapter } = require('casbin-prisma-adapter');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && (r.obj == p.obj || p.obj == '*') && (r.act == p.act || p.act == '*')
`;

async function testEnforcer() {
  console.log('Connecting to database...');
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Initializing Casbin Enforcer with PrismaAdapter...');
  try {
    const model = new Model();
    model.loadModelFromText(modelText);
    
    // Pass the prisma instance directly
    const pa = await PrismaAdapter.newAdapter(prisma);
    const e = await newEnforcer(model, pa);
    
    console.log('Check: student, mcq, read');
    const res1 = await e.enforce('student', 'mcq', 'read');
    console.log('Result:', res1);

    console.log('Check: student, mcq, write');
    const res2 = await e.enforce('student', 'mcq', 'write');
    console.log('Result:', res2);

    console.log('Check: super_admin, mcq, write');
    const res3 = await e.enforce('super_admin', 'mcq', 'write');
    console.log('Result:', res3);

    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err);
    process.exit(1);
  }
}

testEnforcer();
