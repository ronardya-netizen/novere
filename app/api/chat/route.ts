import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { getTopicsForGrade, getSubjectLabel, isSecondary } from '@/lib/curriculum'
import type { Subject, GradeLevel } from '@/lib/curriculum'

const client = new Anthropic()

const PLAN_LIMITS: Record<string, number> = {
  free:       3,
  individual: Infinity,
  family:     Infinity,
}

function buildSystemPrompt(subject: Subject, grade: GradeLevel, chapter: string): string {
  const secondary   = isSecondary(grade)
  const levelLabel  = secondary ? `Secondaire ${grade - 6}` : `${grade}e année primaire`
  const subjectLabel = getSubjectLabel(subject)
  const topic        = getTopicsForGrade(subject, grade)

  const tone = secondary
    ? `Tu parles à un élève de ${levelLabel}. Ton ton est direct, respectueux et intellectuellement stimulant — comme un tuteur universitaire qui prend l'élève au sérieux. Pas de langage enfantin. L'élève est capable de raisonner de façon abstraite.`
    : `Tu parles à un élève de ${levelLabel}. Ton ton est chaleureux, encourageant et accessible — comme un grand frère ou une grande sœur bienveillant(e). Utilise des exemples concrets de la vie quotidienne.`

  return `Tu es Nova, le compagnon d'apprentissage de NOVERE.

${tone}

MATIÈRE : ${subjectLabel}
NIVEAU : ${levelLabel}
CHAPITRE : ${chapter || topic.topic}
PROGRAMME OFFICIEL : ${topic.programLabel}
THÈMES DU CHAPITRE : ${topic.subtopics.join(', ')}

RÈGLES ABSOLUES — tu ne déroges jamais à ces règles :
1. Tu ne donnes JAMAIS la réponse directement. Toujours poser une question qui guide l'élève à trouver par lui-même.
2. Chaque réponse fait maximum 3 phrases. Concis et précis.
3. Toujours terminer par une question ouverte.
4. Si l'élève donne une mauvaise réponse, ne dis pas "non" directement. Demande-lui de reconsidérer avec un indice.
5. Utilise la technique de Feynman : demande à l'élève d'expliquer le concept dans ses propres mots.
6. Reste strictement dans le cadre du chapitre et du programme québécois officiel.
7. Si l'élève est au secondaire, tu peux utiliser un vocabulaire plus technique et des concepts plus abstraits.
8. Si l'élève est au primaire, utilise des analogies simples et des exemples du quotidien.`
}

export async function POST(req: NextRequest) {
  const { messages, subject, grade, chapter, childId } = await req.json()

  // ── Session cap check ────────────────────────────────────────────
  if (childId) {
    // Get parent's plan
    const { data: child } = await supabase
      .from('children')
      .select('parent_id, sessions_today')
      .eq('id', childId)
      .single()

    if (child) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', child.parent_id)
        .single()

      const plan  = profile?.plan ?? 'free'
      const limit = PLAN_LIMITS[plan] ?? 3
      const today = child.sessions_today ?? 0

      if (today >= limit) {
        return NextResponse.json(
          {
            error: 'session_limit_reached',
            plan,
            limit,
            message: plan === 'free'
              ? 'Tu as atteint ta limite de 3 sessions aujourd\'hui. Demande à tes parents de passer au plan individuel pour des sessions illimitées!'
              : 'Limite de sessions atteinte.',
          },
          { status: 429 }
        )
      }

      // Increment sessions_today on first message of a new session
      // A "session" starts when messages.length === 1 (first user message)
      if (messages.length === 1) {
        await supabase
          .from('children')
          .update({ sessions_today: today + 1 })
          .eq('id', childId)
      }
    }
  }

  // ── AI call ──────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(
    subject as Subject,
    Number(grade) as GradeLevel,
    chapter ?? ''
  )

  const response = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system:     systemPrompt,
    messages:   messages,
  })

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  return NextResponse.json({ response: text })
}
