import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Crypto News API',
  description: '100% FREE crypto news API. No API keys. No rate limits. 7 sources.',
  keywords: ['crypto', 'news', 'api', 'bitcoin', 'defi', 'free', 'rss'],
  openGraph: {
    title: 'Free Crypto News API',
    description: '100% FREE crypto news API. No API keys. No rate limits. 7 sources.',
    type: 'website',
    url: 'https://free-crypto-news.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Crypto News API',
    description: '100% FREE crypto news API. No API keys. No rate limits. 7 sources.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
