export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Hero */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 700,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #00ff88 0%, #00ccff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Free Crypto News API
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          color: '#888',
          marginBottom: '40px',
        }}>
          Self-host your own crypto news aggregator.<br/>
          7 sources. Zero dependencies. MIT licensed.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://github.com/nirholas/free-crypto-news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: '#fafafa',
              color: '#0a0a0a',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            ⭐ Star on GitHub
          </a>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirholas%2Ffree-crypto-news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              background: 'transparent',
              color: '#fafafa',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              border: '1px solid #333',
            }}
          >
            ▲ Deploy Your Own
          </a>
        </div>
      </section>

      {/* Why */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#00ff88' }}>Why?</h2>
        <p style={{ color: '#aaa', lineHeight: 1.8, fontSize: '1.1rem' }}>
          Every crypto news API charges $30-300/month and requires API keys.
          This is a free, open-source alternative you can deploy yourself in one click.
        </p>
      </section>

      {/* Sources */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#00ccff' }}>7 News Sources</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {[
            { name: 'CoinDesk', cat: 'General' },
            { name: 'The Block', cat: 'Research' },
            { name: 'Decrypt', cat: 'Web3' },
            { name: 'CoinTelegraph', cat: 'Global' },
            { name: 'Bitcoin Magazine', cat: 'Bitcoin' },
            { name: 'Blockworks', cat: 'DeFi' },
            { name: 'The Defiant', cat: 'DeFi' },
          ].map((s) => (
            <div key={s.name} style={{
              padding: '16px',
              background: '#111',
              borderRadius: '8px',
              border: '1px solid #222',
            }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>{s.cat}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoints */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#00ff88' }}>API Endpoints</h2>
        <div style={{
          background: '#111',
          borderRadius: '8px',
          border: '1px solid #222',
          overflow: 'hidden',
        }}>
          {[
            { path: '/api/news', desc: 'Latest from all sources' },
            { path: '/api/search?q=bitcoin', desc: 'Search by keywords' },
            { path: '/api/defi', desc: 'DeFi news only' },
            { path: '/api/bitcoin', desc: 'Bitcoin news only' },
            { path: '/api/breaking', desc: 'Last 2 hours' },
            { path: '/api/sources', desc: 'List all sources' },
          ].map((e, i) => (
            <div key={e.path} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: i < 5 ? '1px solid #222' : 'none',
            }}>
              <code style={{ color: '#00ccff' }}>{e.path}</code>
              <span style={{ color: '#666' }}>{e.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#00ccff' }}>Quick Start</h2>
        <div style={{
          background: '#111',
          borderRadius: '8px',
          border: '1px solid #222',
          padding: '24px',
        }}>
          <pre style={{
            margin: 0,
            color: '#aaa',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            overflow: 'auto',
          }}>
{`# Clone & run
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news
npm install
npm run dev

# Test it
curl http://localhost:3000/api/news`}
          </pre>
        </div>
      </section>

      {/* Integrations */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#00ff88' }}>Works With</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {['Python', 'JavaScript', 'ChatGPT', 'Claude MCP', 'LangChain', 'Discord', 'Telegram', 'cURL'].map((t) => (
            <span key={t} style={{
              padding: '8px 16px',
              background: '#111',
              borderRadius: '20px',
              border: '1px solid #222',
              fontSize: '0.875rem',
            }}>
              {t}
            </span>
          ))}
        </div>
        <p style={{ color: '#666', marginTop: '16px', fontSize: '0.95rem' }}>
          See the <a href="https://github.com/nirholas/free-crypto-news" style={{ color: '#00ccff' }}>README</a> for code examples.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px',
        textAlign: 'center',
        color: '#444',
        fontSize: '0.875rem',
      }}>
        MIT Licensed • Made by <a href="https://github.com/nirholas" style={{ color: '#666' }}>nich</a>
      </footer>
    </main>
  );
}
