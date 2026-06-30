import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const postFiles = import.meta.glob('../posts/*.md', { eager: true });

  const entries = Object.entries(postFiles)
    .map(([path, file]: [string, any]) => {
      if (file.frontmatter?.hidden) return null;

      const slug = path.split('/').pop()?.replace('.md', '') || '';
      const fm = file.frontmatter || {};
      const isMicro = !fm.title;

      const cleanSlugTitle = slug.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, '').replace(/-/g, ' ');
      const microTitle = slug.replace(/^(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-\d{2}$/, '$1 $2:$3');
      const title = isMicro ? microTitle : fm.title || cleanSlugTitle;

      let content = '';
      try {
        content = file.compiledContent()
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      } catch {
        try {
          const raw = file.rawContent();
          content = raw.replace(/^---[\s\S]*?---\s*/, '')
            .replace(/<[^>]*>/g, '')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        } catch {
          content = '';
        }
      }

      const tags = isMicro ? ['microblog'] : fm.tags ? fm.tags.split(' ') : [];

      return {
        slug,
        title,
        content,
        tags,
      };
    })
    .filter(Boolean);

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};
