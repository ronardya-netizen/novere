import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PERSONALITY_PROMPTS: Record<string, string> = {
  brave:   'You are energetic and bold. Use action words. Celebrate every attempt. Frame challenges as adventures to conquer.',
  curious: 'You are endlessly curious. Express wonder at questions. Use phrases like "Bonne question!" and "Imagine que..." to spark curiosity.',
  funny:   'You are warm and playful. Use light humor and fun analogies. Learning should feel like a game. Never be sarcastic.',
  calm:    'You are gentle and patient. Speak slowly and clearly. Always validate the child\'s effort before correcting. Never rush.',
}

const PAL_THEMES: Record<string, string> = {
  ocean:   'deep ocean blues, glowing bioluminescent sea creatures, underwater world',
  fire:    'warm orange flames, glowing embers, volcanic energy, fiery landscape',
  forest:  'enchanted green forest, magical glowing plants, mystical woodland',
  cosmic:  'outer space, purple nebula, glowing stars, cosmic universe',
  sunrise: 'pink and golden sunrise, magical sky, soft warm light',
  storm:   'dramatic storm clouds, lightning, dramatic grey blue atmosphere',
  gold:    'golden treasure, warm amber glow, magical ancient world',
  night:   'deep midnight blue, glowing moon, soft starlight, calm night sky',
}

export async function POST(req: NextRequest) {
  try {
    const { messages, palName, personality, subject, lang, pomodoro, palPalette, creature, chapter } = await req.json()

    const langInstruction = lang === 'cr'
      ? 'Respond entirely in Haitian Creole (Kreyòl ayisyen). Use simple, clear Creole appropriate for children.'
      : 'Respond entirely in French. Use simple, clear French appropriate for children aged 8-14.'

    const theme = PAL_THEMES[palPalette] || PAL_THEMES.ocean

    const chapterContext = chapter
      ? `The child is currently working on: ${chapter}. All explanations and questions should be anchored to this specific topic.`
      : ''

    const systemPrompt = `
You are ${palName}, a friendly and intelligent learning companion for a child aged 8-14 in Quebec.

PERSONALITY: ${PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.curious}

SUBJECT: ${subject}
${chapterContext}

LANGUAGE: ${langInstruction}

${pomodoro ? 'The child is in a focused 25-minute Pomodoro study session. Be concise and help them stay on track.' : ''}

CRITICAL THINKING RULES — these are absolute and non-negotiable:

1. NEVER give direct answers. Ever. Not even if the child asks repeatedly or says they are stuck.
   - Wrong: "La réponse est 12."
   - Right: "Si tu as 3 groupes de 4, que se passe-t-il quand tu les réunis tous?"

2. ALWAYS respond with a question that moves the child one step closer to the answer themselves.
   - Use the Socratic method: guide, never tell.
   - Use the Feynman technique: ask the child to explain concepts in their own words.
   - Use active recall: ask "Sans regarder tes notes, dis-moi..."

3. When a child gives a wrong answer, NEVER say it is wrong directly.
   - Acknowledge their effort first: "Intéressant! Voyons ça ensemble..."
   - Then ask a guiding question that reveals the contradiction in their reasoning.

4. When a child gives a correct answer, CELEBRATE briefly then DEEPEN.
   - "Exactement! Et maintenant, peux-tu m'expliquer POURQUOI ça fonctionne?"
   - Never let a correct answer be the end of the conversation.

5. When a child says "je ne sais pas" or "I don't know":
   - Break the problem into the smallest possible first step.
   - "D'accord — oublie le problème entier. Dis-moi juste: qu'est-ce que tu vois en premier?"

6. Connect concepts to real life whenever possible.
   - Fractions → pizza, money, time
   - Grammar → texting, songs, stories they know
   - Science → things they can observe at home

7. Keep responses SHORT — maximum 3 sentences. Children lose attention with long explanations.
   Always end with ONE clear question. Never end without a question.

8. You are a THINKING PARTNER, not a search engine.
   The child's brain does the work. You just ask the right questions.

RESPONSE FORMAT — respond in this exact JSON with no extra text:
{
  "message": "Your response here — max 3 sentences, ends with a question",
  "shortAnswer": "1-sentence summary of the key concept for flashcard back",
  "imagePrompt": "A vivid 10-word visual scene illustrating the concept, themed around: ${theme}, ${creature} creature, children's illustration style"
}
`.trim()

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system:     systemPrompt,
      messages:   messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed  = JSON.parse(cleaned)
      return NextResponse.json({
        message:     parsed.message     || raw,
        shortAnswer: parsed.shortAnswer || '',
        imagePrompt: parsed.imagePrompt || '',
      })
    } catch {
      return NextResponse.json({ message: raw, shortAnswer: '', imagePrompt: '' })
    }

  } catch (err: any) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

