package io.cryptocurrencycv;

import com.google.gson.annotations.SerializedName;

/**
 * Represents a single crypto news article from the Free Crypto News API.
 *
 * <p>price_impact and tone fields inspired by
 * executium/trending-historical-cryptocurrency-news (MIT License).
 */
public class NewsArticle {

    public String title;
    public String link;
    public String description;

    @SerializedName("pubDate")
    public String pubDate;

    public String source;

    @SerializedName("sourceKey")
    public String sourceKey;

    public String category;

    @SerializedName("timeAgo")
    public String timeAgo;

    /** Article author (when available). */
    public String author;

    /** Source domain, e.g. "cointelegraph.com". */
    public String domain;

    /** Thumbnail image URL. */
    public String image;

    /**
     * Price impact of the article within 1 hour of publication.
     * Inspired by executium/trending-historical-cryptocurrency-news (MIT).
     */
    @SerializedName("price_impact")
    public PriceImpact priceImpact;

    /**
     * 7-dimension tone analysis.
     * Inspired by executium/trending-historical-cryptocurrency-news (MIT).
     */
    public Tone tone;

    // ── Nested types ────────────────────────────────────────────

    public static class PriceImpact {
        /** Percentage price change (positive = up, negative = down). */
        public Double percentage;
        /** "positive", "negative", or "neutral". */
        public String direction;
        /** Raw impact score. */
        public Double score;
    }

    public static class Tone {
        public double anger;
        public double fear;
        public double joy;
        public double sadness;
        public double analytical;
        public double confident;
        public double tentative;
    }

    @Override
    public String toString() {
        return "[" + source + "] " + title + " (" + pubDate + ")";
    }
}
