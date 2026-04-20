import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

export const flashModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
export const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
