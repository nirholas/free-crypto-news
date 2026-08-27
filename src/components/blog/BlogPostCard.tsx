/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { CATEGORIES, type BlogPostMeta } from "@/lib/blog";

export function formatPostDate(date: string): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Card used on the blog index, category pages, and related-post rails.
 * The whole card is one link so the target is obvious and keyboard reachable.
 */
export function BlogPostCard({ post }: { post: BlogPostMeta }) {
  const category = CATEGORIES[post.category];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={post.title}
    >
      <Card className="flex flex-col h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge>
              {category.icon} {category.name}
            </Badge>
            {post.featured && <Badge variant="breaking">Featured</Badge>}
          </div>
          <CardTitle className="text-base group-hover:text-accent transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-3">{post.description}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto">
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-xs text-text-secondary">
              {formatPostDate(post.date)}
              {post.readingTime ? ` · ${post.readingTime}` : ""}
            </span>
            <span className="text-xs text-accent font-medium">Read →</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
