<?php

namespace CryptoNews\Endpoints;

use CryptoNews\Http\HttpClient;
use CryptoNews\Models\Price;
use CryptoNews\Models\Response;

class Market
{
    private HttpClient $http;

    public function __construct(HttpClient $http)
    {
        $this->http = $http;
    }

    /**
     * Get cryptocurrency prices.
     *
     * @param string|null $symbols Comma-separated symbols (e.g., "BTC,ETH")
     * @return Price[]
     */
    public function prices(?string $symbols = null): array
    {
        $params = [];
        if ($symbols !== null) {
            $params['symbols'] = $symbols;
        }
        $data = $this->http->get('/api/market/prices', $params);
        $prices = $data['prices'] ?? [];
        return array_map(function (array $item) {
            return new Price($item);
        }, $prices);
    }

    /**
     * Get Fear & Greed Index.
     *
     * @return Response
     */
    public function fearGreed(): Response
    {
        return new Response($this->http->get('/api/market/fear-greed'));
    }

    /**
     * Get trending cryptocurrencies.
     *
     * @param int $limit Maximum results
     * @return Response
     */
    public function trending(int $limit = 10): Response
    {
        return new Response($this->http->get('/api/market/trending', ['limit' => $limit]));
    }
}
