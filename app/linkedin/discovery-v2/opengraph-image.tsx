import { ImageResponse } from 'next/og'

export const alt = 'SC-Analytics discovery call preview'
export const size = { width: 1200, height: 627 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '627px', display: 'flex', background: '#ffffff' }}>
        <img src="https://www.sc-analytics.io/og/discovery.jpg" alt="" width="1200" height="627" style={{ width: '1200px', height: '627px', objectFit: 'cover' }} />
      </div>
    ),
    size
  )
}
