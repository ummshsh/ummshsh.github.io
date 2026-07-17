export interface ProcessedPost {
    isMicro: boolean;
    path: string;
    file: any;
    frontmatter: Record<string, any>;
    rawContentStr: string;
}

export function processPostFiles(postFiles: Record<string, any>): ProcessedPost[] {
    return Object.entries(postFiles)
        .map(([path, file]: [string, any]) => {
            let rawContentStr = "";
            if (typeof file.rawContent === "function") {
                rawContentStr = file.rawContent();
            } else if (typeof file.rawContent === "string") {
                rawContentStr = file.rawContent;
            }

            const frontmatter = file.frontmatter || {};
            const isMicro = !frontmatter.title;

            return {
                isMicro,
                path,
                file,
                frontmatter,
                rawContentStr,
            };
        })
        .filter((post) => !post.frontmatter.hidden);
}

export function getDateTimeFromPath(path: string): string {
    const match = path.match(/(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})-(\d{1,2})/);
    if (match) {
        const [, year, month, day, hour, minute, second] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
    }
    const dateMatch = path.match(/(\d{4}-\d{1,2}-\d{1,2})/);
    if (dateMatch) {
        const parts = dateMatch[1].split("-");
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}T00:00:00`;
    }
    return "";
}

export function sortPosts(posts: ProcessedPost[]): ProcessedPost[] {
    return [...posts].sort((a, b) => {
        const dateTimeA = a.frontmatter.date || getDateTimeFromPath(a.path);
        const dateTimeB = b.frontmatter.date || getDateTimeFromPath(b.path);
        return dateTimeB.localeCompare(dateTimeA);
    });
}

export function paginatePosts(posts: ProcessedPost[], page: number, postsPerPage: number = 10) {
    const totalPages = Math.ceil(posts.length / postsPerPage) || 1;
    const startIndex = (page - 1) * postsPerPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);

    return {
        paginatedPosts,
        currentPage: page,
        totalPages,
    };
}

export function getSlugFromPath(path: string): string {
    return path.split("/").pop()?.replace(".md", "") || "";
}

export function formatTitleFromSlug(slug: string): string {
    return slug.replace(/^\d{4}-\d{1,2}-\d{1,2}-/, "").replace(/-/g, " ");
}

/**
 * Pre-processes raw markdown, converting kramdown/non-standard syntax into HTML
 * before any markdown processor sees it. This prevents CommonMark HTML blocks
 * (triggered by raw HTML tags like <img> or <iframe>) from swallowing subsequent
 * markdown syntax like links or images.
 *
 * Converts:
 *   ![alt](src){:.clickableimg}  →  <a><img class="clickableimg"></a>
 *   ![alt](src)                   →  <img>
 *   [text](url)                   →  <a>
 *   (::text)                      →  <span class="hover-footnote">
 *   > text                        →  <blockquote>
 *   -/* item                      →  <li> (wrapped in <ul>)
 */
/**
 * Pre-processes raw markdown, converting kramdown/non-standard syntax into HTML
 * before any markdown processor sees it.
 *
 * When `forMarkdownProcessor` is false (default), newlines after <img> and
 * </blockquote> are stripped, and text is wrapped in paragraphs — this is for
 * the excerpt/standalone HTML rendering path.
 *
 * When `forMarkdownProcessor` is true, newlines are preserved so that a
 * downstream CommonMark processor can correctly determine paragraph breaks
 * and avoid treating <img> on its own line as part of a setext heading.
 */
export function preprocessMarkdown(markdown: string, forMarkdownProcessor: boolean = false): string {
    let result = markdown;

    // images with optional kramdown class
    result = result.replace(
        /!\[([^\]]*)\]\(((?:[^()]+|\([^()]*\))+)\)(?:\s*\{:\s*\.([a-zA-Z0-9_-]+)\s*\})?/g,
        (_match: string, alt: string, src: string, cls: string) => {
            const encoded = src.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
            if (cls === "clickableimg") {
                return '<a href="' + encoded + '" target="_blank" rel="noopener noreferrer"><img src="' + encoded + '" alt="' + alt + '" class="clickableimg" style="max-width: 100%; height: auto;"></a>';
            }
            return '<img src="' + encoded + '" alt="' + alt + '" style="max-width: 100%; height: auto;">';
        }
    );

    // hover footnotes (::text) — handles both (::text) and ( ::text)
    result = result.replace(/\(\s*\:\:([^)]+)\)/g, (_match: string, text: string) => {
        const escaped = text.replace(/"/g, '&quot;');
        return '<span class="hover-footnote" data-title="' + escaped + '">&#9733;</span>';
    });

    // inline links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // blockquotes
    result = result.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");

    // list items
    result = result.replace(/^[\s]*[-*]\s+(.*)$/gm, "<li>$1</li>");
    result = result.replace(/((?:<li>.*<\/li>(?:\n|$))+)/g, (match: string) => {
        return `<ul>${match.replace(/\n/g, "")}</ul>`;
    });

    if (!forMarkdownProcessor) {
        // For standalone rendering: strip newlines after blockquotes and images
        // so paragraph wrapping works correctly.
        result = result.replace(/<\/blockquote>\n/g, "</blockquote>");
        result = result.replace(/(<img[^>]*>)\n/g, "$1");
    } else {
        // For CommonMark processor: group lines starting with <img> together with
        // any following non-blank, non-block-level text lines into a single <p>.
        // This prevents orphan text after images when there's no blank line separator.
        result = result.replace(
            /^((?:<a [^>]*>)?<img [^>]*>(?:<\/a>)?)((?:\n(?!\s*$|\s*#|\s*---|\s*>\s*|<blockquote|<ul|<li).*)*)$/gm,
            (_match: string, img: string, rest: string) => {
                const text = rest.replace(/\n+/g, " ");
                return `<p>${img}${text}</p>`;
            }
        );
    }

    return result;
}

export function getExcerpt(post: ProcessedPost): string | null {
    try {
        const rawContent = post.rawContentStr || "";
        const withoutFrontmatter = rawContent.replace(/^---[\s\S]*?---\s*/, "");
        const moreIndex = withoutFrontmatter.indexOf("<!--more-->");

        let contentToProcess = "";

        if (moreIndex === -1) {
            contentToProcess = withoutFrontmatter;
        } else {
            contentToProcess = withoutFrontmatter.substring(0, moreIndex);
        }

        if (contentToProcess.trim().length === 0) return null;

        let processedContent = preprocessMarkdown(contentToProcess.trim());

        const blocks = processedContent.split(/\n{2,}/);
        processedContent = blocks
            .map((block: string) => {
                block = block.trim();
                if (!block) return "";
                if (block.startsWith("<blockquote>") || block.startsWith("<ul>")) return block;
                block = block.replace(/\n/g, " ");
                return "<p>" + block + "</p>";
            })
            .join("\n");

        return processedContent;
    } catch (error) {
        return null;
    }
}

export function hasMoreContent(post: ProcessedPost): boolean {
    const rawContent = post.rawContentStr || "";
    const withoutFrontmatter = rawContent.replace(/^---[\s\S]*?---\s*/, "");
    return withoutFrontmatter.indexOf("<!--more-->") !== -1;
}
