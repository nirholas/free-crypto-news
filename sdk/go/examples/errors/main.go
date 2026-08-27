// Example: error handling with the cryptonews Go SDK.
//
// Demonstrates typed error checking for NetworkError, APIError, and RateLimitError.
//
// Run: go run examples/errors/main.go
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	cryptonews "github.com/nirholas/free-crypto-news/sdk/go"
)

func main() {
	client := cryptonews.NewClient()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	articles, err := client.GetLatest(ctx, 5)
	if err != nil {
		// Check typed errors
		var rateLimitErr *cryptonews.RateLimitError
		var apiErr *cryptonews.APIError
		var netErr *cryptonews.NetworkError

		switch {
		case errors.As(err, &rateLimitErr):
			fmt.Printf("Rate limited — retry after %.0fs\n", rateLimitErr.RetryAfter)
		case errors.As(err, &apiErr):
			fmt.Printf("API error (HTTP %d): %s\n", apiErr.StatusCode, apiErr.Body)
		case errors.As(err, &netErr):
			fmt.Printf("Network error: %s\n", netErr.Message)
		default:
			log.Fatalf("unexpected error: %v", err)
		}
		return
	}

	for _, a := range articles {
		fmt.Printf("%s — %s\n", a.Title, a.Source)
	}
}
