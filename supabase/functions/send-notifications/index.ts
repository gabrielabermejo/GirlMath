import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_APP_ID = '0c6a8d7d-ad27-483e-a9bf-ef1a73dc3baf'
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today = new Date()
  const todayDay = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

  // Get all push subscriptions
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('user_id, player_id')

  if (!subscriptions?.length) return new Response('No subscriptions', { status: 200 })

  let sent = 0

  for (const sub of subscriptions) {
    // Get fixed expenses for this user due in next 3 days
    const { data: expenses } = await supabase
      .from('fixed_expenses')
      .select('description, amount, day_of_month')
      .eq('user_id', sub.user_id)
      .not('day_of_month', 'is', null)

    if (!expenses?.length) continue

    const upcoming = expenses
      .map((e) => {
        let days = e.day_of_month - todayDay
        if (days < 0) days += daysInMonth
        return { ...e, days }
      })
      .filter((e) => e.days <= 3)
      .sort((a, b) => a.days - b.days)

    if (!upcoming.length) continue

    const top = upcoming[0]
    const label = top.days === 0 ? 'hoy' : top.days === 1 ? 'mañana' : `en ${top.days} días`
    const extra = upcoming.length > 1 ? ` y ${upcoming.length - 1} más` : ''

    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [sub.player_id],
        headings: { en: '💸 Gasto fijo próximo — GirlMath' },
        contents: { en: `${top.description} vence ${label}${extra}` },
        url: 'https://girl-math-brown.vercel.app/gastos-fijos',
      }),
    })

    sent++
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
})
