const SUBJECT_META: Record<string, { label: string; icon: string; color: string }> = {
  mathematiques: { label: 'Mathématiques', icon: '🔢', color: '#3B52D4' },
  francais:      { label: 'Français',       icon: '📖', color: '#DB2777' },
  histoire:      { label: 'Histoire',        icon: '🏛️', color: '#D97706' },
  sciences:      { label: 'Sciences',        icon: '🔬', color: '#16A34A' },
}


const LEVEL_META: Record<string, { label: string; color: string }> = {
  debutant:      { label: 'Débutant',      color: '#16A34A' },
  intermediaire: { label: 'Intermédiaire', color: '#D97706' },
  avance:        { label: 'Avancé',        color: '#7C3AED' },
}


export type WeeklyReportData = {
  parentName:        string
  childName:         string
  palName:           string
  palEmoji:          string
  weekStart:         string
  weekEnd:           string
  totalMinutes:      number
  pomodorosCompleted: number
  pointsEarned:      number
  exercisesDone:     number
  currentStreak:     number
  bestDay:           { date: string; minutes: number } | null
  subjects:          Array<{ id: string; minutes: number; level: string }>
}


export function buildWeeklyReportEmail(data: WeeklyReportData): string {
  const hasActivity = data.totalMinutes > 0


  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Récap de la semaine</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FF;font-family:'Helvetica Neue',Arial,sans-serif;">


  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7FF;padding:20px 0;">
    <tr>
      <td align="center">


        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(11,31,75,0.08);">


          ${buildHeader(data)}
          ${hasActivity ? buildActiveBody(data) : buildInactiveBody(data)}
          ${buildSubjectsSection(data)}
          ${hasActivity ? buildAchievementSection(data) : ''}
          ${buildPalNote(data, hasActivity)}
          ${buildCTA()}
          ${buildFooter()}


        </table>


      </td>
    </tr>
  </table>


</body>
</html>`
}


function buildHeader(data: WeeklyReportData): string {
  return `
<tr>
  <td style="background:linear-gradient(135deg,#0B1F4B 0%,#3B52D4 100%);padding:36px 32px 28px;text-align:center;">
    <div style="background:rgba(251,191,36,0.18);border:1px solid rgba(251,191,36,0.4);border-radius:99px;padding:5px 14px;display:inline-block;margin-bottom:18px;">
      <span style="color:#FBBF24;font-size:11px;font-weight:800;letter-spacing:1px;">RÉCAP DE LA SEMAINE</span>
    </div>
    <h1 style="color:#ffffff;font-size:30px;font-weight:700;margin:0 0 6px;font-family:Georgia,serif;">
      Bravo, ${escape(data.childName)}! 🎉
    </h1>
    <p style="color:rgba(255,255,255,0.65);font-size:14px;margin:0;">
      Du ${formatShortDate(data.weekStart)} au ${formatShortDate(data.weekEnd)}
    </p>
  </td>
</tr>`
}


function buildActiveBody(data: WeeklyReportData): string {
  const hours = Math.floor(data.totalMinutes / 60)
  const mins  = data.totalMinutes % 60
  const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} minutes`


  return `
<tr>
  <td style="padding:32px 32px 20px;text-align:center;">
    <p style="color:#94A3B8;font-size:11px;font-weight:700;letter-spacing:1.5px;margin:0 0 8px;">TEMPS D'ÉTUDE</p>
    <p style="color:#0B1F4B;font-size:48px;font-weight:800;margin:0;line-height:1;font-family:Georgia,serif;">
      ${timeStr}
    </p>
    <p style="color:#64748B;font-size:13px;margin:10px 0 0;">
      Une belle progression cette semaine.
    </p>
  </td>
</tr>


<tr>
  <td style="padding:0 32px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:4px;">
          ${statCard('🎯', 'Pomodoros', String(data.pomodorosCompleted), '#3B52D4', '#DBEAFE')}
        </td>
        <td style="padding:4px;">
          ${statCard('⭐', 'Points', String(data.pointsEarned), '#D97706', '#FEF3C7')}
        </td>
      </tr>
      <tr>
        <td style="padding:4px;">
          ${statCard('📚', 'Exercices', String(data.exercisesDone), '#16A34A', '#DCFCE7')}
        </td>
        <td style="padding:4px;">
          ${statCard('🔥', 'Série', `${data.currentStreak} jour${data.currentStreak > 1 ? 's' : ''}`, '#DB2777', '#FCE7F3')}
        </td>
      </tr>
    </table>
  </td>
</tr>`
}


function buildInactiveBody(data: WeeklyReportData): string {
  return `
<tr>
  <td style="padding:36px 32px;text-align:center;">
    <div style="background:linear-gradient(135deg,#FEF3C7,#FDE68A);border-radius:20px;padding:32px 24px;">
      <p style="font-size:48px;margin:0 0 12px;">🌱</p>
      <p style="color:#0B1F4B;font-size:18px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
        Une semaine pour recommencer
      </p>
      <p style="color:#92400E;font-size:14px;margin:0;line-height:1.6;">
        ${escape(data.childName)} n'a pas étudié cette semaine. Pas de souci, chaque grande aventure commence par un premier pas. Encouragez ${escape(data.childName)} à reprendre lundi avec ${escape(data.palName)}.
      </p>
    </div>
  </td>
</tr>`
}


function statCard(icon: string, label: string, value: string, color: string, bg: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border-radius:16px;">
  <tr>
    <td style="padding:18px 16px;text-align:center;">
      <div style="font-size:24px;margin-bottom:6px;">${icon}</div>
      <p style="color:${color};font-size:24px;font-weight:800;margin:0 0 2px;font-family:Georgia,serif;line-height:1;">
        ${value}
      </p>
      <p style="color:#64748B;font-size:11px;font-weight:600;margin:6px 0 0;text-transform:uppercase;letter-spacing:0.5px;">
        ${label}
      </p>
    </td>
  </tr>
</table>`
}


function buildSubjectsSection(data: WeeklyReportData): string {
  if (data.subjects.length === 0) return ''


  const rows = data.subjects.map(s => {
    const meta = SUBJECT_META[s.id] || { label: s.id, icon: '📚', color: '#64748B' }
    const lvl  = LEVEL_META[s.level] || LEVEL_META.debutant
    return `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="44" style="vertical-align:middle;">
          <div style="width:36px;height:36px;background:${meta.color}22;border-radius:10px;text-align:center;line-height:36px;font-size:18px;">
            ${meta.icon}
          </div>
        </td>
        <td style="vertical-align:middle;padding-left:4px;">
          <p style="color:#0B1F4B;font-size:14px;font-weight:700;margin:0 0 3px;">${meta.label}</p>
          <span style="background:${lvl.color}22;color:${lvl.color};font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;">
            ${lvl.label}
          </span>
        </td>
        <td style="vertical-align:middle;text-align:right;">
          <p style="color:${meta.color};font-size:16px;font-weight:800;margin:0;font-family:Georgia,serif;">
            ${s.minutes} min
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`
  }).join('')


  return `
<tr>
  <td style="padding:0 32px 28px;">
    <div style="background:#F8FAFF;border:1px solid #E2E8F0;border-radius:18px;padding:20px 22px;">
      <p style="color:#0B1F4B;font-size:13px;font-weight:800;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.5px;">
        Matières étudiées
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rows}
      </table>
    </div>
  </td>
</tr>`
}


function buildAchievementSection(data: WeeklyReportData): string {
  if (!data.bestDay) return ''
  return `
<tr>
  <td style="padding:0 32px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#0B1F4B,#3B52D4);border-radius:18px;">
      <tr>
        <td style="padding:22px 24px;">
          <p style="color:#FBBF24;font-size:11px;font-weight:800;letter-spacing:1px;margin:0 0 6px;">🏆 MOMENT FORT</p>
          <p style="color:#ffffff;font-size:17px;font-weight:700;margin:0 0 6px;font-family:Georgia,serif;">
            La meilleure journée de ${escape(data.childName)}
          </p>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;line-height:1.5;">
            ${formatLongDate(data.bestDay.date)} avec <strong style="color:#FBBF24;">${data.bestDay.minutes} minutes</strong> de focus.
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}


function buildPalNote(data: WeeklyReportData, hasActivity: boolean): string {
  const message = hasActivity
    ? `Cette semaine, ${escape(data.childName)} a vraiment montré sa volonté d'apprendre. Continuez à l'encourager, votre soutien fait toute la différence.`
    : `Je serai prêt à accueillir ${escape(data.childName)} dès qu'il sera disponible. L'apprentissage avance à son propre rythme.`


  return `
<tr>
  <td style="padding:0 32px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FEF9EC;border:1px solid #FBBF24;border-radius:18px;">
      <tr>
        <td width="60" style="vertical-align:top;padding:18px 0 18px 18px;">
          <div style="width:42px;height:42px;background:#FBBF24;border-radius:14px;text-align:center;line-height:42px;font-size:22px;">
            ${escape(data.palEmoji)}
          </div>
        </td>
        <td style="vertical-align:top;padding:18px 18px 18px 12px;">
          <p style="color:#92400E;font-size:11px;font-weight:800;letter-spacing:0.5px;margin:0 0 4px;text-transform:uppercase;">
            Un mot de ${escape(data.palName)}
          </p>
          <p style="color:#451A03;font-size:13px;margin:0;line-height:1.6;">
            ${message}
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}


function buildCTA(): string {
  return `
<tr>
  <td style="padding:0 32px 32px;text-align:center;">
    <a href="https://novere.ca/parent" style="background:#0B1F4B;color:#FBBF24;padding:15px 36px;border-radius:14px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
      Ouvrir le portail parent →
    </a>
    <p style="color:#94A3B8;font-size:11px;margin:14px 0 0;">
      Voir le détail complet et gérer les sessions
    </p>
  </td>
</tr>`
}


function buildFooter(): string {
  return `
<tr>
  <td style="background:#0B1F4B;padding:24px 32px;text-align:center;">
    <p style="color:#FBBF24;font-size:16px;font-weight:800;margin:0 0 8px;font-family:Georgia,serif;">NOVERE</p>
    <p style="color:rgba(255,255,255,0.45);font-size:11px;margin:0 0 14px;line-height:1.5;">
      L'apprentissage qui grandit avec votre enfant.
    </p>
    <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0;">
      <a href="https://novere.ca/parent" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Gérer mes préférences</a>
      &nbsp;·&nbsp;
      <a href="https://novere.ca" style="color:rgba(255,255,255,0.4);text-decoration:underline;">novere.ca</a>
    </p>
  </td>
</tr>`
}


function escape(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!))
}


function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}


function formatLongDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })
}
