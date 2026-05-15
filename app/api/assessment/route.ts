import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTopicsForGrade, getSubjectLabel, isSecondary } from '@/lib/curriculum'
import type { Subject, GradeLevel } from '@/lib/curriculum'


const client = new Anthropic()


const SUBJECT_LABELS: Record<string, string> = {
  mathematiques: 'Mathématiques',
  francais:      'Français',
  histoire:      'Histoire',
  sciences:      'Sciences',
}


export async function POST(req: NextRequest) {
  const { subjects, grade, palName, creature, personality } = await req.json()


  const gradeNum    = Number(grade) as GradeLevel
  const secondary   = isSecondary(gradeNum)
  const gradeLabel  = secondary ? `Secondaire ${gradeNum - 6}` : `${grade}e année primaire`


  // Build curriculum context per subject
  const subjectContexts = subjects.map((s: string) => {
    const curriculum = getTopicsForGrade(s as Subject, gradeNum)
    return `${SUBJECT_LABELS[s] || s}: topics include ${curriculum?.subtopics?.slice(0, 4).join(', ') || 'general curriculum'}`
  }).join('\n')


  const prompt = `You are generating a diagnostic assessment for a ${gradeLabel} student in Quebec, Canada.


Enabled subjects: ${subjects.map((s: string) => SUBJECT_LABELS[s] || s).join(', ')}
Curriculum context:
${subjectContexts}


Generate EXACTLY 3 multiple-choice questions per subject in the style of Quebec Ministry of Education (MEES) assessments.


Rules:
- Write all text in Canadian French
- Questions must be appropriate for ${gradeLabel}
- Question 1 per subject: below grade level (diagnostic baseline)
- Question 2 per subject: at grade level (core competency)
- Question 3 per subject: above grade level (ceiling detection)
- 4 options per question (A, B, C, D)
- One clearly correct answer per question
- Options must be plausible (no obviously wrong answers)
- No trick questions — test genuine understanding
- correct field must be the EXACT text of one of the options


Return ONLY valid JSON. No markdown. No explanation. Format:
{
  "subjects": {
    "subject_id": [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correct": "exact text of correct option",
        "difficulty": 1|2|3,
        "competency": "brief QEP competency (e.g. Résoudre des situations-problèmes)"
      }
    ]
  }
}


Subject IDs to use: ${subjects.join(', ')}`


  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages:   [{ role: 'user', content: prompt }],
    })


    const raw   = response.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const clean = raw.replace(/```json|```/g, '').trim()


    let data
    try {
      data = JSON.parse(clean)
    } catch {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) data = JSON.parse(match[0])
      else throw new Error('Invalid JSON')
    }


    return NextResponse.json(data)
  } catch (err) {
    console.error('Assessment generation error:', err)
    return NextResponse.json({ error: 'Failed to generate assessment' }, { status: 500 })
  }
}
