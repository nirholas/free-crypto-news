package io.cryptocurrencycv;

import java.util.List;

/**
 * Example usage of the Free Crypto News Java SDK.
 */
public class Main {

    public static void main(String[] args) throws Exception {
        CryptoNews client = new CryptoNews();

        System.out.println("=== Latest Crypto News ===");
        List<NewsArticle> articles = client.getLatest(5);
        for (NewsArticle a : articles) {
            System.out.println(a);
        }

        System.out.println("\n=== Bitcoin News ===");
        List<NewsArticle> btc = client.getBitcoin(3);
        for (NewsArticle a : btc) {
            System.out.println(a);
        }

        System.out.println("\n=== Search: 'ethereum' ===");
        List<NewsArticle> results = client.search("ethereum", 3);
        for (NewsArticle a : results) {
            System.out.println(a);
        }
    }
}
