export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        🆓 Free Crypto News API
      </h1>
      <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '2rem' }}>
        100% FREE. No API keys. No rate limits. No BS.
      </p>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '12px', 
        padding: '2rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h2 style={{ marginTop: 0 }}>📡 Try it now</h2>
        <code style={{ 
          display: 'block', 
          background: '#000', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem',
          overflowX: 'auto'
        }}>
          curl https://free-crypto-news.vercel.app/api/news
        </code>
        
        <h3>Endpoints:</h3>
        <ul style={{ lineHeight: 2 }}>
          <li><code>/api/news</code> - Latest news from 7 sources</li>
          <li><code>/api/search?q=bitcoin</code> - Search by keywords</li>
          <li><code>/api/defi</code> - DeFi-specific news</li>
          <li><code>/api/bitcoin</code> - Bitcoin-specific news</li>
          <li><code>/api/breaking</code> - Last 2 hours</li>
          <li><code>/api/sources</code> - List all sources</li>
        </ul>
      </div>
      
      <a 
        href="https://github.com/nirholas/free-crypto-news" 
        style={{ 
          marginTop: '2rem',
          color: '#fff',
          opacity: 0.7,
          textDecoration: 'none'
        }}
      >
        ⭐ Star on GitHub
      </a>
    </main>
  )
}
