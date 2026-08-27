<?php

namespace CryptoNews\Endpoints;

use CryptoNews\Http\HttpClient;
use CryptoNews\Models\Article;
use CryptoNews\Models\Response;

class News
{
    private HttpClient $http;

    public function __construct(HttpClient $http)
    {
        $this->http = $http;
    }

    /**
     * Get latest crypto news.
     *
     * @param int $limit Maximum articles (1-50)
     * @param string|null $source Filter by source
     * @return Article[]
     */
    public function latest(int $limit = 10, ?string $source = null): array
    {
        $params = ['limit' => $limit];
        if ($source !== null) {
            $params['source'] = $source;
        }
        $data = $this->http->get('/api/news', $params);
        return (new Response($data))->getArticles();
    }

    /**
     * Get latest news with full metadata.
     *
     * @param int $limit Maximum articles (1-50)
     * @param string|null $source Filter by source
     */
    public function latestWithMeta(int $limit = 10, ?string $source = null): Response
    {
        $params = ['limit' => $limit];
        if ($source !== null) {
            $params['source'] = $source;
        }
        return new Response($this->http->get('/api/news', $params));
    }

    /**
     * Search news by keywords.
     *
     * @param string $keywords Comma-separated search terms
     * @param int $limit Maximum results (1-30)
     * @return Article[]
     */
    public function search(string $keywords, int $limit = 10): array
    {
        $data = $this->http->get('/api/search', ['q' => $keywords, 'limit' => $limit]);
        return (new Response($data))->getArticles();
    }

    /**
     * Get breaking news (last 2 hours).
     *
     * @param int $limit Maximum articles
     * @return Article[]
     */
    public function breaking(int $limit = 5): array
    {
        $data = $this->http->get('/api/breaking', ['limit' => $limit]);
        return (new Response($data))->getArticles();
    }

    /**
     * Get DeFi-specific news.
     *
     * @param int $limit Maximum articles
     * @return Article[]
     */
    public function defiNews(int $limit = 10): array
    {
        $data = $this->http->get('/api/defi', ['limit' => $limit]);
        return (new Response($data))->getArticles();
    }

    /**
     * Get Bitcoin-specific news.
     *
     * @param int $limit Maximum articles
     * @return Article[]
     */
    public function bitcoin(int $limit = 10): array
    {
        $data = $this->http->get('/api/bitcoin', ['limit' => $limit]);
        return (new Response($data))->getArticles();
    }

    /**
     * Get trending topics.
     *
     * @param int $limit Maximum topics (1-20)
     * @param int $hours Time window (1-72)
     * @return Response
     */
    public function trending(int $limit = 10, int $hours = 24): Response
    {
        return new Response($this->http->get('/api/trending', ['limit' => $limit, 'hours' => $hours]));
    }

    /**
     * Analyze news with sentiment.
     *
     * @param int $limit Maximum articles
     * @param string|null $topic Filter by topic
     * @param string|null $sentiment Filter: bullish, bearish, neutral
     */
    public function analyze(int $limit = 20, ?string $topic = null, ?string $sentiment = null): Response
    {
        $params = ['limit' => $limit];
        if ($topic !== null) {
            $params['topic'] = $topic;
        }
        if ($sentiment !== null) {
            $params['sentiment'] = $sentiment;
        }
        return new Response($this->http->get('/api/analyze', $params));
    }

    /**
     * Get archived historical news.
     *
     * @param string|null $date Date in YYYY-MM-DD format
     * @param string|null $query Search query
     * @param int $limit Maximum articles
     */
    public function archive(?string $date = null, ?string $query = null, int $limit = 50): Response
    {
        $params = ['limit' => $limit];
        if ($date !== null) {
            $params['date'] = $date;
        }
        if ($query !== null) {
            $params['q'] = $query;
        }
        return new Response($this->http->get('/api/archive', $params));
    }

    /**
     * Find original sources of news.
     *
     * @param string|null $query Search query
     * @param string|null $category Filter by category
     * @param int $limit Maximum results
     */
    public function origins(?string $query = null, ?string $category = null, int $limit = 20): Response
    {
        $params = ['limit' => $limit];
        if ($query !== null) {
            $params['q'] = $query;
        }
        if ($category !== null) {
            $params['category'] = $category;
        }
        return new Response($this->http->get('/api/origins', $params));
    }

    /**
     * Get list of all news sources.
     *
     * @return array<int, array<string, mixed>>
     */
    public function sources(): array
    {
        $data = $this->http->get('/api/sources');
        return $data['sources'] ?? [];
    }
}
