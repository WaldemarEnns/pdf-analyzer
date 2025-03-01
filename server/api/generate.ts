import { generateText } from 'ai'
import { model } from '~/services/ai'

export default defineEventHandler(async (event) => {
  try {
    // Get the request body
    const body = await readBody(event)
    const { prompt } = body
    
    if (!prompt || typeof prompt !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Prompt is required and must be a string'
      })
    }
    
    // Generate text using the AI model
    const result = await generateText({
      model,
      prompt
    })
    
    return { result }
  } catch (error) {
    console.error('Error in AI generation:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate AI response',
      cause: error
    })
  }
}) 