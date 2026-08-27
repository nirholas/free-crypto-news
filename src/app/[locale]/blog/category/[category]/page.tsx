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
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageShareSection from "@/components/PageShareSection";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { BreadcrumbStructuredData, CollectionPageStructuredData } from "@/components/StructuredData";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { canonicalUrl, pageMetadata, SITE_NAME } from "@/lib/blog-seo";
import { SITE_URL } from "@/lib/constants";
import {
  CATEGORIES,
  getActiveCategories,
  getCategoryCounts,
  getPostsByCategory,
  isBlogCategory,
} from "@/lib/blog";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getActiveCategories().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isBlogCategory(category)) return {};
  const info = CATEGORIES[category];
  return pageMetadata({
    title: `${info.name} Articles`,
    description: info.description,
    path: `/blog/category/${category}`,
    locale,
    tags: [category, "crypto blog", `${info.name.toLowerCase()} guides`],
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  if (!isBlogCategory(category)) notFound();

  const info = CATEGORIES[category];
  const posts = getPostsByCategory(category);
  const url = canonicalUrl(locale, `/blog/category/${category}`);
  const otherCategories = getCategoryCounts().filter((c) => c.slug !== category);

  return (
    <>
      <CollectionPageStructuredData
        name={`${info.name} Articles`}
        description={info.description}
        url={url}
        articles={posts.map((post) => ({
          title: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
          datePublished: post.date,
          image: post.image ? `${SITE_URL}${post.image}` : undefined,
        }))}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: info.name, url },
        ]}
      />
      <Header />
      <main id="main-content" className="container-main py-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-text-secondary mb-8"
        >
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog" className="hover:text-accent transition-colors">
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-primary font-medium" aria-current="page">
            {info.name}
          </span>
        </nav>

        <section className="mb-12">
          <p className="text-4xl mb-3" aria-hidden="true">
            {info.icon}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-text-primary">
            {info.name}
          </h1>
          <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
            {info.description}
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </p>
        </section>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-secondary text-lg">
                No {info.name.toLowerCase()} articles have been published yet.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-sm text-accent hover:underline"
              >
                Browse all articles
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {otherCategories.length > 0 && (
          <section className="mt-16" aria-labelledby="more-categories">
            <h2
              id="more-categories"
              className="font-serif text-2xl font-bold mb-6 text-text-primary"
            >
              More categories
            </h2>
            <ul className="flex flex-wrap gap-2">
              {otherCategories.map((c) => (
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
          </section>
        )}
      </main>
      <PageShareSection
        title={`${info.name} Articles | ${SITE_NAME}`}
        description={info.description}
        url={url}
      />
      <Footer />
    </>
  );
}
