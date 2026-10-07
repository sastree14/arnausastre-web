import { ImageResponse } from 'next/og'

export const alt = 'SC-Analytics 30-Minute Discovery Call'
export const size = { width: 1200, height: 627 }
export const contentType = 'image/png'

const days = [
  ['', '', '', '', '1','2','3'],
  ['4','5','6','7','8','9','10'],
  ['11','12','13','14','15','16','17'],
  ['18','19','20','21','22','23','24'],
  ['25','26','27','28','29','30','31'],
]

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', background:'#ffffff', color:'#111827', fontFamily:'Arial, sans-serif' }}>
        <div style={{ width:150, borderRight:'1px solid #d1d5db', background:'#f9fafb', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:20, gap:28 }}>
          <div style={{ width:78, height:54, borderRadius:8, background:'#e5effd', color:'#1267d6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
            <div style={{ fontSize:21 }}>▣</div><div style={{ fontSize:13 }}>Calendar</div>
          </div>
          <div style={{ fontSize:14 }}>◉ Notetaker</div>
          <div style={{ fontSize:14 }}>♙ Contacts</div>
          <div style={{ fontSize:14 }}>✣ Automations</div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'28px 70px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:22, fontWeight:700 }}>Wed Oct 07, 2026</div>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ border:'1px solid #9ca3af', borderRadius:8, padding:'10px 18px', fontWeight:700 }}>Today</div>
              <div style={{ width:42, height:42, borderRadius:21, background:'#111827', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>
            </div>
          </div>

          <div style={{ width:610, height:500, marginTop:20, border:'1px solid #9ca3af', borderRadius:8, padding:'24px 28px', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:24, fontWeight:700 }}>October 2026</div>
              <div style={{ fontSize:30 }}>‹  ›</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:28, color:'#374151', fontWeight:700, fontSize:14 }}>
              {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => <div key={d} style={{ width:68, textAlign:'center' }}>{d}</div>)}
            </div>
            <div style={{ display:'flex', flexDirection:'column', marginTop:18, gap:12 }}>
              {days.map((row,ri) => (
                <div key={ri} style={{ display:'flex', justifyContent:'space-between' }}>
                  {row.map((d,di) => (
                    <div key={di} style={{ width:68, height:68, borderRadius:34, display:'flex', alignItems:'center', justifyContent:'center', fontSize:21, fontWeight:700, background:d==='7'?'#d9e9ff':'transparent' }}>
                      {d}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ width:260, display:'flex', flexDirection:'column', justifyContent:'center', paddingRight:55 }}>
          <div style={{ fontSize:12, color:'#496c8a', fontWeight:700, letterSpacing:1.5 }}>SC-ANALYTICS</div>
          <div style={{ fontFamily:'Georgia, serif', fontSize:34, lineHeight:1.1, marginTop:12 }}>Start with the problem.</div>
          <div style={{ fontSize:18, fontWeight:700, marginTop:22 }}>30 minutes</div>
          <div style={{ fontSize:16, color:'#566575', marginTop:8 }}>No cost · No commitment</div>
          <div style={{ fontSize:14, lineHeight:1.4, color:'#566575', marginTop:18 }}>
            A focused first conversation to understand the problem, assess fit and decide whether a next step makes sense.
          </div>
        </div>
      </div>
    ),
    size
  )
}
