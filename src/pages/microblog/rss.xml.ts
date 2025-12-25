import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  // Get all microblog posts as raw strings
  const microPostFiles = import.meta.glob('../../posts_micro/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
  });

  // Process microblog posts manually
  const allMicroPosts = Object.entries(microPostFiles)
    .map(([path, rawContent]: [string, string]) => {
      return {
        file: path,
        rawContent: rawContent.trim(),
      };
    })
    .filter((post) => post.rawContent.length > 0)
    .sort((a, b) => {
      const getDateTimeFromPath = (path: string) => {
        // Extract date and time from filename like 2025-12-22-16-51-41
        const match = path.match(
          /(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})/,
        );
        if (match) {
          const [, year, month, day, hour, minute, second] = match;
          const yearPadded = year;
          const monthPadded = month.padStart(2, '0');
          const dayPadded = day.padStart(2, '0');
          const hourPadded = hour.padStart(2, '0');
          const minutePadded = minute.padStart(2, '0');
          const secondPadded = second.padStart(2, '0');
          return `${yearPadded}-${monthPadded}-${dayPadded}T${hourPadded}:${minutePadded}:${secondPadded}`;
        }
        // Fallback to just date
        const dateMatch = path.match(/(\d{4}-\d{1,2}-\d{1,2})/);
        if (dateMatch) {
          const parts = dateMatch[1].split('-');
          const year = parts[0];
          const month = parts[1].padStart(2, '0');
          const day = parts[2].padStart(2, '0');
          return `${year}-${month}-${day}T00:00:00`;
        }
        return '';
      };
      const dateTimeA = getDateTimeFromPath(a.file);
      const dateTimeB = getDateTimeFromPath(b.file);
      // Sort in descending order (newest first)
      return dateTimeB.localeCompare(dateTimeA);
    });

  // Take only the latest 50 microblog posts for RSS feed
  const recentPosts = allMicroPosts.slice(0, 50);

  // Helper functions
  function getSlugFromPath(path: string): string {
    return path.split('/').pop()?.replace('.md', '') || '';
  }

  function getDateTimeFromPath(path: string): string {
    // Extract date and time from filename like 2025-12-22-16-51-41
    const match = path.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})/,
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      const yearPadded = year;
      const monthPadded = month.padStart(2, '0');
      const dayPadded = day.padStart(2, '0');
      const hourPadded = hour.padStart(2, '0');
      const minutePadded = minute.padStart(2, '0');
      const secondPadded = second.padStart(2, '0');
      return `${yearPadded}-${monthPadded}-${dayPadded}T${hourPadded}:${minutePadded}:${secondPadded}`;
    }
    // Fallback to just date
    const dateMatch = path.match(/(\d{4}-\d{1,2}-\d{1,2})/);
    if (dateMatch) {
      const parts = dateMatch[1].split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00`;
    }
    return '';
  }

  function getMicroPostContent(post: any): string {
    try {
      let processedContent = post.rawContent;

      if (processedContent.length === 0) {
        return '';
      }

      // Replace Jekyll site.url with empty string or relative path
      processedContent = processedContent.replace(/\{\{site\.url\}\}/g, '');

      // Remove Jekyll-style CSS classes like {:.clickableimg}
      processedContent = processedContent.replace(/\{:[^}]+\}/g, '');

      // Convert markdown images: ![alt](src) -> <img src="src" alt="alt">
      processedContent = processedContent.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" class="clickableimg">',
      );

      // Convert tooltip syntax: (::tooltip text) -> <span class="hover-footnote" data-title="tooltip text">*</span>
      processedContent = processedContent.replace(
        /\(\:\:([^)]+)\)/g,
        '<span class="hover-footnote" data-title="$1">*</span>',
      );

      // Convert markdown links: [text](url) -> <a href="url">text</a>
      processedContent = processedContent.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2">$1</a>',
      );

      // Convert line breaks to <br> tags
      processedContent = processedContent.replace(/\n/g, '<br>');

      return processedContent;
    } catch (error) {
      return '';
    }
  }

  const rssItems = recentPosts
    .map((post) => {
      const slug = getSlugFromPath(post.file);
      const dateTime = getDateTimeFromPath(post.file);
      const content = getMicroPostContent(post);
      const postUrl = `${site}microblog/${slug}`;
      const pubDate = dateTime ? new Date(dateTime).toUTCString() : new Date().toUTCString();
      
      // Create a title from the content (first 50 characters or first sentence)
      const plainContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const title = plainContent.length > 50 
        ? plainContent.substring(0, 50) + '...' 
        : plainContent || 'Microblog post';
      
      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <description><![CDATA[${content}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>microblog</category>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ummshsh - Microblog</title>
    <description>Quick thoughts and updates from ummshsh</description>
    <link>${site}microblog</link>
    <atom:link href="${site}microblog/rss.xml" rel="self" type="application/rss+xml"/>
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