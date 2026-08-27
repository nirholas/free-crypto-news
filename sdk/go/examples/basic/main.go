// Example: basic usage of the cryptonews Go SDK.
//
// Run: go run examples/basic/main.go
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	cryptonews "github.com/nirholas/free-crypto-news/sdk/go"
)

func main() {
	client := cryptonews.NewClient()

	// Use a context with timeout for all API calls.
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// ── Latest news ─────────────────────────────────────────────
	fmt.Println("=== Latest Crypto News ===")
	articles, err := client.GetLatest(ctx, 5)
	if err != nil {
		log.Fatal(err)
	}
	for _, a := range articles {
		fmt.Printf("  %s\n    %s • %s\n    %s\n\n", a.Title, a.Source, a.TimeAgo, a.Link)
	}

	// ── Search ──────────────────────────────────────────────────
	fmt.Println("=== Search: 'ethereum ETF' ===")
	results, err := client.Search(ctx, "ethereum ETF", 3)
	if err != nil {
		log.Fatal(err)
	}
	for _, a := range results {
		fmt.Printf("  %s (%s)\n", a.Title, a.Source)
	}

	// ── Trending ────────────────────────────────────────────────
	fmt.Println("\n=== Trending Topics ===")
	trending, err := client.GetTrending(ctx, 5, 24)
	if err != nil {
		log.Fatal(err)
	}
	for _, t := range trending.Trending {
		fmt.Printf("  %s: %d mentions (%s)\n", t.Topic, t.Count, t.Sentiment)
	}

	// ── Prices ──────────────────────────────────────────────────
	fmt.Println("\n=== Bitcoin Price ===")
	prices, err := client.GetPrices(ctx, "bitcoin")
	if err != nil {
		log.Printf("prices: %v\n", err)
	} else {
		fmt.Printf("  %v\n", prices)
	}

	// ── Fear & Greed ────────────────────────────────────────────
	fmt.Println("\n=== Fear & Greed Index ===")
	fg, err := client.GetFearGreed(ctx)
	if err != nil {
		log.Printf("fear-greed: %v\n", err)
	} else {
		fmt.Printf("  Value: %d (%s)\n", fg.Value, fg.Classification)
	}

	// ── Sources ─────────────────────────────────────────────────
	fmt.Println("\n=== Sources ===")
	sources, err := client.GetSources(ctx)
	if err != nil {
		log.Fatal(err)
	}
	for _, s := range sources {
		fmt.Printf("  %s (%s) — %s\n", s.Name, s.Key, s.Status)
	}
}
