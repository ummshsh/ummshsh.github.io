import type { APIRoute } from 'astro';
import { getAllPosts, getExcerpt, getDateFromFilename } from '../utils/posts';

export const GET: APIRoute = async ({ site }) => {
  // Get all regular posts
  const postFiles = import.meta.glob('../posts/*.md', {
    eager: true,
  });

  const posts = getAllPosts(postFiles);
  
  // Take latest 100 posts for RSS feed (reasonable limit)
  const recentPosts = posts.slice(0, 100);

  const rssItems = recentPosts
    .map((post) => {
      const slug = post.file.split('/').pop()?.replace('.md', '') || '';
      const dateStr = getDateFromFilename(post.file);
      const pubDate = dateStr ? new Date(dateStr).toUTCString() : new Date().toUTCString();
      const excerpt = getExcerpt(post);
      const postUrl = `${site}posts/${slug}`;
      
      return `
    <item>
      <title><![CDATA[${post.frontmatter.title || 'Untitled'}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <description><![CDATA[${excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${post.frontmatter.tags ? `<category>${post.frontmatter.tags}</category>` : ''}
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ummshsh - Blog</title>
    <description>Personal blog posts by ummshsh</description>
    <link>${site}</link>
    <atom:link href="${site}rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>ummshsh@example.com (ummshsh)</managingEditor>
    <webMaster>ummshsh@example.com (ummshsh)</webMaster>
    <generator>Astro</generator>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};