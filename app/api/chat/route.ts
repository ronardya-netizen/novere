import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TECHNIQUE_PROMPTS: Record<string, string> = {
  socratic:  'Use the Socratic method. Never give direct answers. Always respond with a guiding question that helps the child discover the answer themselves.',
  feynman:   'Use the Feynman technique. Ask the child to explain the concept in simple words as if teaching a younger child. Then gently correct misconceptions.',
  recall:    'Use active recall. Ask the child to retrieve information from memory before explaining anything. Say "Sans regarder tes notes, dis-moi..."',
  pomodoro:  'The child is in a focused 25-minute study session. Be encouraging, concise, and help them stay on track.',
  interleave:'Mix between related topics to strengthen connections. After answering, bridge to a related concept.',
}

const PERSONALITY_PROMPTS: Record<string, string> = {
  brave:   'You are energetic and bold. Use action words. Celebrate every attempt. Frame challenges as adventures to conquer.',
  curious: 'You are endlessly curious. Express wonder at questions. Use phrases like "Bonne question!" and "Imagine que..." to spark curiosity.',
  funny:   'You are warm and playful. Use light humor and fun analogies. Learning should feel like a game. Never be sarcastic.',
  calm:    'You are gentle and patient. Speak slowly and clearly. Always validate the child\'s effort before correcting. Never rush.',
}

export async function POST(req: NextRequest) {
  try {
    const { messages, palName, personality, technique, subject, lang } = await req.json()

    const langInstruction = lang === 'cr'
      ? 'Respond entirely in Haitian Creole (Kreyòl ayisyen). Use simple, clear Creole appropriate for children.'
      : 'Respond entirely in French. Use simple, clear French appropriate for children aged 8-14.'

    const systemPrompt = `
You are ${palName}, a friendly learning companion for a child aged 8-14.

PERSONALITY: ${PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.curious}

TEACHING TECHNIQUE: ${TECHNIQUE_PROMPTS[technique] || TECHNIQUE_PROMPTS.socratic}

SUBJECT FOCUS: ${subject || 'General learning'}

LANGUAGE: ${langInstruction}

RULES:
- Always stay in character as ${palName}
- Keep responses short — maximum 3 sentences unless explaining a complex concept
- Never give homework answers directly — guide the child to discover them
- Always end with either a question or an encouraging statement
- Use emojis sparingly but warmly
- If the child seems frustrated, acknowledge their effort first
- You are NOT a general assistant — only help with educational topics
`.trim()

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system:     systemPrompt,
      messages:   messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ message: text })

  } catch (err: any) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

