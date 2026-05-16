import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTopicsForGrade } from '@/lib/curriculum'
import type { Subject, GradeLevel } from '@/lib/curriculum'


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


const DAY_CODES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']


function getWeekStart(): string {
  const now = new Date()
  const dow = now.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}


function getWeekNumber(): number {
  const start = new Date('2026-01-01').getTime()
  return Math.floor((Date.now() - start) / (7 * 24 * 60 * 60 * 1000))
}


async function generatePlan(childId: string) {
  // Get child info
  const { data: child } = await supabaseAdmin
    .from('children')
    .select('grade, enabled_subjects')
    .eq('id', childId)
    .single()


  if (!child) return {}


  const grade   = (child.grade ?? 5) as GradeLevel
  const subjects = (child.enabled_subjects ?? ['mathematiques','francais','histoire','sciences']) as Subject[]


  // Get schedule
  const { data: schedule } = await supabaseAdmin
    .from('focus_schedules')
    .select('days')
    .eq('child_id', childId)
    .eq('active', true)
    .maybeSingle()


  const scheduledDays: string[] = schedule?.days || ['Lun','Mar','Mer','Jeu','Ven']


  // Get assessment levels per subject
  const { data: assessments } = await supabaseAdmin
    .from('child_assessments')
    .select('subject, level')
    .eq('child_id', childId)


  const levelMap: Record<string, string> = {}
  for (const a of assessments || []) levelMap[a.subject] = a.level


  // Build plan
  const weekNumber = getWeekNumber()
  const plan: Record<string, any> = {}


  let scheduledIdx = 0
  for (const dayCode of DAY_CODES) {
    if (!scheduledDays.includes(dayCode)) {
      plan[dayCode] = null
      continue
    }


    // Rotate subjects across scheduled days
    const subject = subjects[scheduledIdx % subjects.length]
    scheduledIdx++


    // Rotate chapter based on week + subject offset
    const curriculum = getTopicsForGrade(subject, grade)
    const subtopics  = curriculum?.subtopics || []
    const chapter    = subtopics.length > 0
      ? subtopics[(weekNumber + scheduledIdx) % subtopics.length]
      : null


    plan[dayCode] = {
      subject,
      chapter,
      level:  levelMap[subject] || 'debutant',
      mode:   'exercises',
    }
  }


  return plan
}


function getTodayPlan(plan: Record<string, any>) {
  const dayCode = DAY_CODES[new Date().getDay()]
  return plan[dayCode] ? { ...plan[dayCode], dayCode } : null
}


export async function GET(req: NextRequest) {
  try {
    const childId = req.nextUrl.searchParams.get('childId')
    if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 })


    const weekStart = getWeekStart()


    // Check existing plan
    const { data: existing } = await supabaseAdmin
      .from('study_plans')
      .select('plan')
      .eq('child_id', childId)
      .eq('week_start', weekStart)
      .maybeSingle()


    let plan: Record<string, any>
    if (existing) {
      plan = existing.plan
    } else {
      plan = await generatePlan(childId)
      await supabaseAdmin.from('study_plans').upsert({
        child_id:   childId,
        week_start: weekStart,
        plan,
      }, { onConflict: 'child_id,week_start' })
    }


    const today = getTodayPlan(plan)


    return NextResponse.json({ plan, today, weekStart })
  } catch (err) {
    console.error('Study plan error:', err)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}


// Force regenerate (e.g. after parent changes subjects)
export async function POST(req: NextRequest) {
  try {
    const { childId } = await req.json()
    if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 })


    const weekStart = getWeekStart()
    const plan = await generatePlan(childId)


    await supabaseAdmin.from('study_plans').upsert({
      child_id:   childId,
      week_start: weekStart,
      plan,
    }, { onConflict: 'child_id,week_start' })


    const today = getTodayPlan(plan)
    return NextResponse.json({ plan, today, weekStart })
  } catch (err) {
    console.error('Study plan regen error:', err)
    return NextResponse.json({ error: 'Failed to regenerate plan' }, { status: 500 })
  }
}
