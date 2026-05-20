import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildWeeklyReportEmail } from '@/lib/email-templates'
import type { WeeklyReportData } from '@/lib/email-templates'


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


const resend = new Resend(process.env.RESEND_API_KEY!)


function getWeekRange() {
  const now = new Date()
  // Sunday's date
  const sunday = new Date(now)
  sunday.setHours(23, 59, 59, 999)


  // Monday (start of week)
  const monday = new Date(sunday)
  monday.setDate(sunday.getDate() - 6)
  monday.setHours(0, 0, 0, 0)


  return {
    weekStart: monday.toISOString().split('T')[0],
    weekEnd:   sunday.toISOString().split('T')[0],
    startISO:  monday.toISOString(),
    endISO:    sunday.toISOString(),
  }
}


export async function GET(req: NextRequest) {
  // Verify cron auth
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  try {
    const range = getWeekRange()


    // Get all opted-in parents
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, notif_weekly_report')
      .eq('notif_weekly_report', true)


    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No opted-in parents' })
    }


    let sent    = 0
    let skipped = 0
    let failed  = 0


    for (const profile of profiles) {
      try {
        // Get user email from auth
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id)
        if (!user?.email) { skipped++; continue }


        // Get child
        const { data: child } = await supabaseAdmin
          .from('children')
          .select('id, name, streak_days, pal')
          .eq('parent_id', profile.id)
          .maybeSingle()


        if (!child) { skipped++; continue }


        // Check if already sent for this week
        const { data: existing } = await supabaseAdmin
          .from('weekly_reports')
          .select('id')
          .eq('child_id', child.id)
          .eq('week_start', range.weekStart)
          .maybeSingle()


        if (existing) { skipped++; continue }


        // Get sessions in this week
        const { data: sessions } = await supabaseAdmin
          .from('study_sessions')
          .select('*')
          .eq('child_id', child.id)
          .gte('created_at', range.startISO)
          .lte('created_at', range.endISO)


        // Compute stats
        const totalMinutes       = sessions?.reduce((s, x) => s + (x.duration_mins || 0), 0) || 0
        const pomodorosCompleted = sessions?.filter(x => x.technique === 'pomodoro').length || 0
        const pointsEarned       = sessions?.reduce((s, x) => s + (x.points_earned || 0), 0) || 0


        // Get exercises count
        const { count: exercisesDone } = await supabaseAdmin
          .from('study_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('child_id', child.id)
          .eq('technique', 'exercises')
          .gte('created_at', range.startISO)
          .lte('created_at', range.endISO)


        // Get assessment levels
        const { data: assessments } = await supabaseAdmin
          .from('child_assessments')
          .select('subject, level')
          .eq('child_id', child.id)


        const levelMap: Record<string, string> = {}
        for (const a of assessments || []) levelMap[a.subject] = a.level


        // Subject breakdown
        const subjectMinutes: Record<string, number> = {}
        for (const s of sessions || []) {
          const subj = mapSubjectLabelToId(s.subject)
          if (!subj) continue
          subjectMinutes[subj] = (subjectMinutes[subj] || 0) + (s.duration_mins || 0)
        }


        const subjects = Object.entries(subjectMinutes).map(([id, minutes]) => ({
          id,
          minutes,
          level: levelMap[id] || 'debutant',
        }))


        // Find best day
        const dailyMinutes: Record<string, number> = {}
        for (const s of sessions || []) {
          const day = s.created_at.split('T')[0]
          dailyMinutes[day] = (dailyMinutes[day] || 0) + (s.duration_mins || 0)
        }
        const bestEntry = Object.entries(dailyMinutes).sort((a, b) => b[1] - a[1])[0]
        const bestDay = bestEntry ? { date: bestEntry[0], minutes: bestEntry[1] } : null


        const data: WeeklyReportData = {
          parentName:         profile.full_name || 'Parent',
          childName:          child.name,
          palName:            (child.pal as any)?.name || 'ton compagnon',
          palEmoji:           '🌟',
          weekStart:          range.weekStart,
          weekEnd:            range.weekEnd,
          totalMinutes,
          pomodorosCompleted,
          pointsEarned,
          exercisesDone:      exercisesDone || 0,
          currentStreak:      (child as any).streak_days || 0,
          bestDay,
          subjects,
        }


        const html = buildWeeklyReportEmail(data)


       await resend.emails.send({
        from:    'NOVERE <bonjour@novere.ca>',
        replyTo: 'plateforme.novere@gmail.com',
        to:      user.email,
        subject: `Récap de la semaine de ${child.name} 📚`,
        html,
        })



        // Record that we sent it
        await supabaseAdmin.from('weekly_reports').insert({
          child_id:   child.id,
          week_start: range.weekStart,
        })


        sent++
      } catch (innerErr) {
        console.error(`Failed to send for profile ${profile.id}:`, innerErr)
        failed++
      }
    }


    return NextResponse.json({ sent, skipped, failed, weekStart: range.weekStart })
  } catch (err) {
    console.error('Weekly report cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}


function mapSubjectLabelToId(label: string): string | null {
  const map: Record<string, string> = {
    'Mathématiques': 'mathematiques',
    'Français':      'francais',
    'Histoire':      'histoire',
    'Sciences':      'sciences',
  }
  return map[label] || null
}
