import { createXai } from "@ai-sdk/xai"
import { createAnthropic } from "@ai-sdk/anthropic"

const xai = createXai({
    apiKey: process.env.XAI_API_KEY,
})

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export const model = xai('grok-beta')
export const modelVision = anthropic('claude-3-5-sonnet-latest')
