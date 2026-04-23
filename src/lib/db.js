import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  // Use DIRECT_URL in development to avoid Supabase PgBouncer pooler connection drops
  const connectionString = process.env.NODE_ENV === 'development' 
    ? process.env.DIRECT_URL || process.env.DATABASE_URL
    : process.env.DATABASE_URL
    
  if (!connectionString) {
    console.error("CRITICAL: Database connection string is not defined in environment variables!")
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
