<?php

namespace CryptoNews\Endpoints;

use CryptoNews\Http\HttpClient;
use CryptoNews\Models\Response;

class DeFi
{
    private HttpClient $http;

    public function __construct(HttpClient $http)
    {
        $this->http = $http;
    }

    /**
     * Get DeFi total value locked data.
     *
     * @return Response
     */
    public function tvl(): Response
    {
        return new Response($this->http->get('/api/defi/tvl'));
    }

    /**
     * Get DeFi yield opportunities.
     *
     * @param int $limit Maximum results
     * @return Response
     */
    public function yields(int $limit = 10): Response
    {
        return new Response($this->http->get('/api/defi/yields', ['limit' => $limit]));
    }
}
