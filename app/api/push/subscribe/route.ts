import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(req: NextRequest) {
  try {
    const { subscription, childId } = await req.json()
    if (!subscription || !childId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }


    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({ child_id: childId, subscription }, { onConflict: 'child_id' })


    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { childId } = await req.json()
    if (!childId) return NextResponse.json({ error: 'Missing childId' }, { status: 400 })
    await supabaseAdmin.from('push_subscriptions').delete().eq('child_id', childId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
