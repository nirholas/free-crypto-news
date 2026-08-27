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
import { Badge } from "@/components/ui/Badge";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import { BlogMarkdown } from "@/components/blog/BlogMarkdown";
import { BlogPostCard, formatPostDate } from "@/components/blog/BlogPostCard";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { canonicalUrl, pageMetadata } from "@/lib/blog-seo";
import { SITE_URL } from "@/lib/constants";
import {
  CATEGORIES,
  getAdjacentPosts,
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const metadata = pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    locale,
    type: "article",
    image: post.image,
    publishedTime: post.date,
    modifiedTime: post.updatedAt ?? post.date,
    authors: [post.author.name],
    tags: post.tags,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: [post.author.name],
      section: CATEGORIES[post.category].name,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = CATEGORIES[post.category];
  const related = getRelatedPosts(post, 3);
  const { newer, older } = getAdjacentPosts(post.slug);
  const url = canonicalUrl(locale, `/blog/${post.slug}`);

  return (
    <>
      <BlogArticleJsonLd post={post} url={url} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: category.name, url: `${SITE_URL}/blog/category/${post.category}` },
          { name: post.title, url },
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
          <Link
            href={`/blog/category/${post.category}`}
            className="hover:text-accent transition-colors"
          >
            {category.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-primary font-medium truncate" aria-current="page">
            {post.title}
          </span>
        </nav>

        <article className="mx-auto max-w-3xl">
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Link
                href={`/blog/category/${post.category}`}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Badge className="hover:bg-surface-secondary transition-colors">
                  {category.icon} {category.name}
                </Badge>
              </Link>
              {post.featured && <Badge variant="breaking">Featured</Badge>}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-text-primary mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              {post.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary border-y border-border py-3">
              <span className="font-medium text-text-primary">{post.author.name}</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              {post.updatedAt && post.updatedAt !== post.date && (
                <span>
                  Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
                </span>
              )}
              <span>{post.readingTime}</span>
            </div>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:scroll-mt-24 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-surface-tertiary prose-code:before:content-none prose-code:after:content-none">
            <BlogMarkdown source={post.content} />
          </div>

          {post.tags.length > 0 && (
            <section aria-label="Tags" className="mt-10 pt-6 border-t border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">
                Tagged
              </h2>
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-block rounded-full border border-border px-3 py-1 text-sm text-text-secondary hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav
            aria-label="Adjacent posts"
            className="mt-10 grid gap-4 sm:grid-cols-2 border-t border-border pt-6"
          >
            {newer ? (
              <Link
                href={`/blog/${newer.slug}`}
                className="group rounded-lg border border-border p-4 hover:border-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="text-xs uppercase tracking-wide text-text-secondary">
                  ← Newer
                </span>
                <span className="mt-1 block font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {newer.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {older && (
              <Link
                href={`/blog/${older.slug}`}
                className="group rounded-lg border border-border p-4 text-right hover:border-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:col-start-2"
              >
                <span className="text-xs uppercase tracking-wide text-text-secondary">
                  Older →
                </span>
                <span className="mt-1 block font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {older.title}
                </span>
              </Link>
            )}
          </nav>
        </article>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-serif text-2xl font-bold mb-6 text-text-primary"
            >
              Related articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogPostCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/blog"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition"
            >
              All articles
            </Link>
            <Link
              href="/learn"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-tertiary transition"
            >
              Learn Crypto
            </Link>
          </div>
        </div>
      </main>
      <PageShareSection title={post.title} description={post.description} url={url} />
      <Footer />
    </>
  );
}
