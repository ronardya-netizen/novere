import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)


const DAY_MAP: Record<number, string> = {
  0: 'Dim', 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam',
}


export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  try {
    // Get current Montreal time
    const now          = new Date()
    const montrealTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Montreal' }))
    const todayDay     = DAY_MAP[montrealTime.getDay()]
    const currentHour  = montrealTime.getHours()
    const currentMin   = montrealTime.getMinutes()


    // Find all active schedules for today
    const { data: schedules } = await supabaseAdmin
      .from('focus_schedules')
      .select('child_id, start_time, days')
      .eq('active', true)
      .contains('days', [todayDay])


    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No schedules for today' })
    }


    let sent = 0


    for (const schedule of schedules) {
      const [schedHour, schedMin] = schedule.start_time.split(':').map(Number)


      // Fire notification within a 30-minute window before start time
      const schedTotalMin  = schedHour * 60 + schedMin
      const currentTotalMin = currentHour * 60 + currentMin
      const diff = schedTotalMin - currentTotalMin


      // Send if we're within 0-29 minutes before the scheduled time
      if (diff < 0 || diff >= 30) continue


      // Get child info and push subscription
      const [{ data: child }, { data: sub }] = await Promise.all([
        supabaseAdmin.from('children').select('name, pal').eq('id', schedule.child_id).single(),
        supabaseAdmin.from('push_subscriptions').select('subscription').eq('child_id', schedule.child_id).single(),
      ])


      if (!sub?.subscription || !child) continue


      const palName  = (child.pal as any)?.name || 'ton compagnon'
      const timeStr  = `${String(schedHour).padStart(2,'0')}:${String(schedMin).padStart(2,'0')}`


      const payload = JSON.stringify({
        title: `NOVERE 📚`,
        body:  `${palName} t'attend! C'est l'heure d'étudier (${timeStr}).`,
        url:   'https://novere.ca/home',
      })


      try {
        await webpush.sendNotification(sub.subscription as any, payload)
        sent++
      } catch (pushErr: any) {
        // Subscription expired — remove it
        if (pushErr.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('child_id', schedule.child_id)
        }
        console.error(`Push failed for child ${schedule.child_id}:`, pushErr.message)
      }
    }


    return NextResponse.json({ sent, message: `Sent ${sent} notification(s)` })
  } catch (err) {
    console.error('Cron notify error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
