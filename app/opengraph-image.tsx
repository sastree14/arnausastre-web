import { ImageResponse } from 'next/og'

export const alt = 'SC-Analytics — Better Decisions. Better Business Outcomes.'
export const size = { width: 1200, height: 627 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#ffffff', color:'#0d1b2a', fontFamily:'Arial, sans-serif' }}>
        <div style={{ height:42, display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid #d8dee6', fontSize:12, gap:28 }}>
          <div style={{ fontFamily:'Georgia, serif', fontWeight:700, fontSize:15 }}>SC-ANALYTICS</div>
          <div style={{ display:'flex', gap:22, color:'#46566a' }}>
            <span>Inicio</span><span>Servicios</span><span>Casos de éxito</span><span>Conocimiento</span><span>Partner Data e IA</span><span>Por qué SC-Analytics</span>
          </div>
          <div style={{ padding:'8px 14px', background:'#0d1b2a', color:'#fff', fontWeight:700 }}>Contacta con nosotros</div>
        </div>

        <div style={{ height:318, background:'#0d1b2a', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:12, letterSpacing:2, color:'#9cc0e3', fontWeight:700, marginBottom:16 }}>SC-ANALYTICS · CONSULTORÍA CUANTITATIVA Y TECNOLÓGICA</div>
          <div style={{ fontFamily:'Georgia, serif', fontSize:44, lineHeight:1.04, textAlign:'center', width:720 }}>
            Mejores decisiones. Mejores<br/>resultados empresariales.
          </div>
          <div style={{ fontSize:16, lineHeight:1.35, textAlign:'center', width:650, marginTop:18 }}>
            Ayudamos a empresas a planificar mejor, optimizar operaciones y automatizar<br/>decisiones cuando los datos pueden generar impacto real.
          </div>
          <div style={{ display:'flex', gap:12, marginTop:18 }}>
            <div style={{ background:'#fff', color:'#0d1b2a', padding:'10px 18px', fontWeight:700 }}>Contacta con nosotros</div>
            <div style={{ border:'1px solid #90a6bc', padding:'9px 18px', fontWeight:700 }}>Conoce cómo trabajamos</div>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:28 }}>
          <div style={{ fontSize:11, letterSpacing:2, fontWeight:700, color:'#496c8a' }}>QUÉ HACEMOS</div>
          <div style={{ fontFamily:'Georgia, serif', fontSize:31, marginTop:10 }}>De la necesidad a una solución operativa.</div>
          <div style={{ display:'flex', marginTop:24, width:650, height:110 }}>
            {[
              ['01','Comprender','Definimos qué debe mejorar.','#ffffff','#0d1b2a'],
              ['02','Diseñar','Elegimos el enfoque adecuado.','#e8eef4','#0d1b2a'],
              ['03','Construir','Lo convertimos en un sistema utilizable.','#527796','#ffffff'],
              ['04','Mejorar','Medimos y refinamos lo que aporta valor.','#0d1b2a','#ffffff'],
            ].map(([n,t,d,bg,fg]) => (
              <div key={n} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:bg, color:fg, border:'1px solid #ccd6e0', padding:10 }}>
                <div style={{ fontSize:11, fontWeight:700 }}>{n}</div>
                <div style={{ fontFamily:'Georgia, serif', fontSize:19, marginTop:8 }}>{t}</div>
                <div style={{ fontSize:10, textAlign:'center', marginTop:14 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
