import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

// Using the absolute latest models to avoid "available to new users" 404 errors
export const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
export const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
