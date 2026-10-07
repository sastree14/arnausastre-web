import { ImageResponse } from 'next/og'

export const alt = 'SC-Analytics Technical Portfolio'
export const size = { width: 1200, height: 627 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', background:'#ffffff', color:'#161b22', fontFamily:'Arial, sans-serif', padding:'0 96px' }}>
        <div style={{ width:745, display:'flex', flexDirection:'column', borderLeft:'1px solid #d0d7de', borderRight:'1px solid #d0d7de' }}>
          <div style={{ height:56, display:'flex', alignItems:'center', gap:24, padding:'0 24px', borderBottom:'1px solid #d0d7de', fontSize:17 }}>
            <strong>▣ README</strong><span style={{ color:'#57606a' }}>⚖ Security</span>
          </div>
          <div style={{ padding:'30px 30px 18px' }}>
            <div style={{ fontSize:31, fontWeight:700 }}>SC-Analytics Portfolio</div>
            <div style={{ height:1, background:'#d8dee4', margin:'12px 0 20px' }} />
            <div style={{ fontSize:16, lineHeight:1.45 }}>
              This repository contains <strong>32 completed projects</strong> developed by SC-Analytics across AI agents, data engineering,<br/>
              forecasting, business intelligence, machine learning, risk, optimization, finance and quantitative systems.
            </div>
            <div style={{ fontSize:16, marginTop:18 }}>The portfolio is designed for two audiences at the same time:</div>
            <div style={{ display:'flex', flexDirection:'column', fontSize:15, lineHeight:1.45, marginTop:12, paddingLeft:20 }}>
              <span>• a business stakeholder can understand the problem, impact and operating use case without reading code</span>
              <span>• a technical reviewer can inspect architecture, technologies, SQL, tests and local execution paths</span>
            </div>
            <div style={{ fontSize:27, fontWeight:700, marginTop:24 }}>Start here</div>
            <div style={{ height:1, background:'#d8dee4', margin:'8px 0 12px' }} />
            <div style={{ display:'flex', flexDirection:'column', gap:7, fontSize:17, color:'#0969da', paddingLeft:20 }}>
              <span>• Browse all 32 projects</span>
              <span>• Browse by technology</span>
              <span>• Browse all project visuals</span>
              <span>• Open the principal code entrypoints</span>
              <span>• SC-Analytics methodology</span>
              <span>• Data confidentiality</span>
            </div>
          </div>
        </div>
        <div style={{ width:260, padding:'14px 28px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontWeight:700, fontSize:18 }}>Contributors</div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:20, paddingBottom:20, borderBottom:'1px solid #d0d7de' }}>
            <div style={{ width:30, height:30, borderRadius:15, background:'#1f2937', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>AS</div>
            <strong>sastree14</strong>
          </div>
          <div style={{ fontWeight:700, fontSize:18, marginTop:28 }}>Languages</div>
          <div style={{ width:220, height:10, background:'#2878b5', marginTop:18 }} />
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:12, fontSize:14 }}>
            <span>● Python 93.9%</span>
            <span>● TypeScript 3.1%</span>
            <span>● R 1.3% · Other 1.7%</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
