<?php

namespace CryptoNews\Endpoints;

use CryptoNews\Http\HttpClient;
use CryptoNews\Models\Response;

class OnChain
{
    private HttpClient $http;

    public function __construct(HttpClient $http)
    {
        $this->http = $http;
    }

    /**
     * Get whale alert data.
     *
     * @param int $limit Maximum results
     * @return Response
     */
    public function whaleAlerts(int $limit = 10): Response
    {
        return new Response($this->http->get('/api/onchain/whale-alerts', ['limit' => $limit]));
    }

    /**
     * Get gas price data.
     *
     * @return Response
     */
    public function gas(): Response
    {
        return new Response($this->http->get('/api/onchain/gas'));
    }
}
