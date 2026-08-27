/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Link } from "@/i18n/navigation";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";

/**
 * Internal links use the locale-aware router link so `/defi` resolves to the
 * reader's locale; external links open in a new tab with rel protection.
 */
function MarkdownLink({ href = "", children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  const isAnchor = href.startsWith("#");
  return (
    <a
      href={href}
      {...rest}
      {...(isAnchor ? {} : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
    </a>
  );
}

function MarkdownImage({ alt = "", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} loading="lazy" decoding="async" {...rest} />;
}

function MarkdownTable(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}

const components = {
  a: MarkdownLink,
  img: MarkdownImage,
  table: MarkdownTable,
};

/**
 * Renders a content/blog markdown body. Posts are plain CommonMark + GFM,
 * so the MDX compiler runs in `md` format: no JSX or expressions are parsed,
 * which keeps stray `<` and `{` characters in prose from breaking the build.
 */
export function BlogMarkdown({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          format: "md",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, [rehypeHighlight, { detect: false, ignoreMissing: true }]],
        },
      }}
    />
  );
}
