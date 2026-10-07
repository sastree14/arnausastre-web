import type { Metadata } from 'next'

const destination = 'https://github.com/sastree14/Portfolio_SC_Analytics'

export const metadata: Metadata = {
  title: 'SC-Analytics | Technical Portfolio',
  description: 'Public portfolio with selected projects across data science, AI, forecasting, optimisation, automation and decision systems.',
  openGraph: {
    title: 'SC-Analytics | Technical Portfolio',
    description: 'Explore 32 selected SC-Analytics projects across AI, forecasting, optimisation, machine learning, automation and quantitative systems.',
    url: 'https://sc-analytics.io/portfolio',
    siteName: 'SC-Analytics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Technical Portfolio',
    description: 'Selected systems and technical projects by SC-Analytics.',
  },
}

export default function PortfolioBridge() {
  return (
    <main style={{ minHeight:'100vh', display:'grid', placeItems:'center', fontFamily:'Arial, sans-serif', padding:32 }}>
      <div style={{ maxWidth:640 }}>
        <h1>SC-Analytics Technical Portfolio</h1>
        <p>Opening the public technical portfolio on GitHub…</p>
        <p><a href={destination}>Continue to the portfolio</a></p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace(${JSON.stringify(destination)});` }} />
    </main>
  )
}
