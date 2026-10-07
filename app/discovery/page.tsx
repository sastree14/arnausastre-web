import type { Metadata } from 'next'

const destination = 'https://calendly.com/arnau-sastre-sc-analytics/30min'

export const metadata: Metadata = {
  title: 'Book a 30-Minute Discovery Call',
  description: 'A first 30-minute conversation with SC-Analytics to understand the problem, assess fit and decide whether a next step makes sense. No cost and no commitment.',
  openGraph: {
    title: 'Book a 30-Minute Discovery Call | SC-Analytics',
    description: '30 minutes · no cost · no commitment. Start with the problem and assess whether there is a sensible case for action.',
    url: 'https://sc-analytics.io/discovery',
    siteName: 'SC-Analytics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a 30-Minute Discovery Call | SC-Analytics',
    description: '30 minutes · no cost · no commitment.',
  },
}

export default function DiscoveryBridge() {
  return (
    <main style={{ minHeight:'100vh', display:'grid', placeItems:'center', fontFamily:'Arial, sans-serif', padding:32 }}>
      <div style={{ maxWidth:640 }}>
        <h1>30-Minute Discovery Call</h1>
        <p>Opening the SC-Analytics scheduling page…</p>
        <p><a href={destination}>Continue to Calendly</a></p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(destination)});` }} />
    </main>
  )
}
