/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageShareSection from "@/components/PageShareSection";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { CollectionPageStructuredData } from "@/components/StructuredData";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { canonicalUrl, pageMetadata, SITE_NAME } from "@/lib/blog-seo";
import { SITE_URL } from "@/lib/constants";
import { getAllPostsMeta, getCategoryCounts } from "@/lib/blog";

type Props = {
  params: Promise<{ locale: string }>;
};

const DESCRIPTION =
  "In-depth articles, guides, and analysis on Bitcoin, Ethereum, DeFi, trading strategies, and the crypto ecosystem.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Blog",
    description: DESCRIPTION,
    path: "/blog",
    locale,
    tags: ["crypto blog", "bitcoin articles", "ethereum guides", "defi analysis"],
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getAllPostsMeta();
  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);
  const categories = getCategoryCounts();
  const url = canonicalUrl(locale, "/blog");

  return (
    <>
      <CollectionPageStructuredData
        name="Blog"
        description={DESCRIPTION}
        url={url}
        articles={posts.slice(0, 50).map((post) => ({
          title: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
          datePublished: post.date,
          image: post.image ? `${SITE_URL}${post.image}` : undefined,
        }))}
      />
      <Header />
      <main id="main-content" className="container-main py-10">
        <section className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-text-primary">
            Blog
          </h1>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
            In-depth articles, guides, and analysis on cryptocurrency and
            blockchain technology.
          </p>
        </section>

        {categories.length > 0 && (
          <nav aria-label="Blog categories" className="mb-12">
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span aria-hidden="true">{c.icon}</span>
                    {c.name}
                    <span className="text-xs opacity-70">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {featured.length > 0 && (
          <section className="mb-12" aria-labelledby="featured-heading">
            <h2
              id="featured-heading"
              className="font-serif text-2xl font-bold mb-6 text-text-primary"
            >
              Featured
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="all-heading">
          <h2
            id="all-heading"
            className="font-serif text-2xl font-bold mb-6 text-text-primary"
          >
            All Articles
          </h2>
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-text-secondary text-lg">
                  Blog coming soon. Stay tuned for articles on crypto and
                  blockchain.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block text-sm text-accent hover:underline"
                >
                  ← Back to News
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(regular.length > 0 ? regular : posts).map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/learn"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition"
            >
              Learn Crypto
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition"
            >
              Latest News
            </Link>
          </div>
        </div>
      </main>
      <PageShareSection
        title={`${SITE_NAME} Blog: Insights & Analysis`}
        description="In-depth crypto insights, market analysis, and project deep-dives."
        url={url}
      />
      <Footer />
    </>
  );
}
