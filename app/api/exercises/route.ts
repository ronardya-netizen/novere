import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSubjectLabel, getTopicsForGrade, isSecondary } from '@/lib/curriculum'
import type { Subject, GradeLevel } from '@/lib/curriculum'


const client = new Anthropic()


const UNIVERSE_THEMES: Record<string, { world: string; framing: string }> = {
  land:   { world: 'forêt enchantée', framing: 'Dans la forêt de' },
  sea:    { world: 'océan profond',   framing: 'Dans l\'océan de'  },
  sky:    { world: 'royaume céleste', framing: 'Dans le ciel de'   },
  cosmic: { world: 'cosmos infini',   framing: 'Dans le cosmos de' },
}


const PERSONALITY_VOICE: Record<string, { correct: string; wrong: string }> = {
  brave:   { correct: 'Incroyable! Tu as le courage d\'un vrai guerrier!', wrong: 'Un guerrier ne s\'arrête jamais! Réessaie, tu peux y arriver!' },
  curious: { correct: 'Brillant! Tu as trouvé la réponse comme un vrai explorateur!', wrong: 'Intéressant... La bonne réponse nous cache encore un secret. Essaie encore!' },
  funny:   { correct: 'Ha! Tu es trop fort(e)! Même moi j\'aurais mis du temps!', wrong: 'Oups! Même les meilleurs font des erreurs... enfin surtout les autres 😄 Réessaie!' },
  calm:    { correct: 'Très bien. Chaque bonne réponse est un pas de plus vers la sagesse.', wrong: 'Prends une grande respiration. La réponse est là, tu t\'en approches.' },
}


export async function POST(req: NextRequest) {
  const { subject, grade, chapter, palName, creature, personality, lang, childId } = await req.json()


  const theme       = UNIVERSE_THEMES[creature] || UNIVERSE_THEMES.land
  const voice       = PERSONALITY_VOICE[personality] || PERSONALITY_VOICE.curious
  const subjectLabel = getSubjectLabel(subject as Subject)
  const curriculum   = getTopicsForGrade(subject as Subject, Number(grade) as GradeLevel)
  const secondary   = isSecondary(Number(grade) as GradeLevel)
  const gradeLabel   = secondary ? `Secondaire ${Number(grade) - 6}` : `${grade}e année primaire`
  const langLabel    = lang === 'fr' ? 'French Canadian' : 'Haitian Creole'
  const isMath       = subject === 'mathematiques'


  const prompt = `You are generating 12 interactive educational exercises for a ${gradeLabel} student.


Subject: ${subjectLabel}
Chapter: ${chapter || curriculum?.topic || 'général'}
Curriculum topics: ${curriculum?.subtopics?.join(', ') || ''}
Language: ${langLabel} — write ALL text in ${langLabel}


The child's companion is named ${palName}. Their universe is the ${theme.world}.
Frame questions using this universe: "${theme.framing} ${palName}..."
Companion personality — correct reaction voice: "${voice.correct}"
Companion personality — wrong reaction voice: "${voice.wrong}"


Generate EXACTLY 12 exercises in this distribution:
- Exercises 1–2: type "true_false", difficulty 1
- Exercises 3–4: type "multiple_choice", difficulty 1  
- Exercise 5: type "fill_blank", difficulty 2
- Exercise 6: type "match", difficulty 2
- Exercises 7–8: type "multiple_choice", difficulty 2
- Exercise 9: type "order", difficulty 2
- Exercise 10: type "fill_blank", difficulty 3
- Exercise 11: type ${isMath ? '"quick_calc"' : '"multiple_choice"'}, difficulty 3
- Exercise 12: type "match", difficulty 3


RULES:
- All text must be in ${langLabel}
- Every question must reference ${palName}'s universe (${theme.world})
- palReactionCorrect must match the personality voice style above
- palReactionWrong must include a hint toward the correct answer
- For fill_blank: provide exactly 4 options including the correct answer
- For match: provide exactly 4 pairs
- For order: provide 4–5 steps shuffled, plus correctOrder with proper sequence
- For quick_calc: provide a calculation appropriate for ${gradeLabel}
- correct field for multiple_choice/fill_blank/true_false: must be exact copy of one option
- correct field for order: leave empty string, use correctOrder instead


Return ONLY a valid JSON array. No markdown fences. No explanation. Start with [ and end with ].


Each exercise object:
{
  "type": "multiple_choice"|"true_false"|"fill_blank"|"match"|"order"|"quick_calc",
  "question": "string",
  "options": ["string"],
  "correct": "string",
  "pairs": [{"left":"string","right":"string"}],
  "steps": ["string"],
  "correctOrder": ["string"],
  "explanation": "1-2 sentence explanation in ${langLabel}",
  "difficulty": 1|2|3,
  "palReactionCorrect": "string",
  "palReactionWrong": "string"
}`


  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages:   [{ role: 'user', content: prompt }],
    })


    const raw  = response.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const clean = raw.replace(/```json|```/g, '').trim()


    let exercises
    try {
      exercises = JSON.parse(clean)
    } catch {
      // Try to extract array if there's surrounding text
      const match = clean.match(/\[[\s\S]*\]/)
      if (match) exercises = JSON.parse(match[0])
      else throw new Error('Invalid JSON')
    }


    if (!Array.isArray(exercises)) throw new Error('Not an array')


    return NextResponse.json({ exercises: exercises.slice(0, 12) })
  } catch (err) {
    console.error('Exercise generation error:', err)
    return NextResponse.json({ error: 'Failed to generate exercises' }, { status: 500 })
  }
}


