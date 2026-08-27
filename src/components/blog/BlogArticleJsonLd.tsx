/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { NonceScript } from "@/components/NonceScript";
import { SITE_URL } from "@/lib/constants";
import type { BlogPost } from "@/lib/blog";

/**
 * schema.org Article for a blog post. Distinct from the NewsArticle emitter in
 * StructuredData.tsx: evergreen guides are not news and should not be indexed as such.
 */
export function BlogArticleJsonLd({ post, url }: { post: BlogPost; url: string }) {
  const image = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${SITE_URL}${post.image}`
    : `${SITE_URL}/og-image.png`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [image],
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Crypto Vision",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    articleSection: post.category,
    keywords: post.tags.join(", "),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "Crypto Vision", url: SITE_URL },
  };

  return (
    <NonceScript
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
