export interface Post {
  file: string;
  frontmatter: {
    title: string;
    tags?: string;
    hidden?: boolean;
    date?: string;
  };
  rawContent: () => string;
  compiledContent: () => string;
  Content: any;
}

export function getAllPosts(postFiles: Record<string, any>): Post[] {
  const posts = Object.values(postFiles) as Post[];

  // Sort posts by filename (date) in descending order and filter out hidden posts
  return posts
    .filter((post) => !post.frontmatter.hidden)
    .sort((a, b) => {
      const dateA =
        a.file.split("/").pop()?.split("-").slice(0, 3).join("-") || "";
      const dateB =
        b.file.split("/").pop()?.split("-").slice(0, 3).join("-") || "";
      return dateB.localeCompare(dateA);
    });
}

export function getExcerpt(post: Post): string {
  try {
    const content = post.compiledContent();
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex !== -1) {
      return content.substring(0, moreIndex).trim();
    }

    // If no <!--more--> tag, take first 200 characters
    const plainText = content
      .replace(/<blockquote[^>]*>/g, "")
      .replace(/<\/blockquote>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/#{1,6}\s/g, "");
    return plainText.length > 200
      ? plainText.substring(0, 200) + "..."
      : plainText;
  } catch (error) {
    // If compilation fails, return a simple excerpt from raw content
    const rawContent = post.rawContent ? post.rawContent() : "";
    const plainText = rawContent
      .replace(/#{1,6}\s/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/^\s*>\s*/gm, "");
    return plainText.length > 200
      ? plainText.substring(0, 200) + "..."
      : plainText.substring(0, 100) + "...";
  }
}

export function getDateFromFilename(filename: string): string {
  const match = filename.match(/(\d{4}-\d{1,2}-\d{1,2})/);
  if (match) {
    // Normalize single-digit days/months to double digits for consistent sorting
    const parts = match[1].split("-");
    const year = parts[0];
    const month = parts[1].padStart(2, "0");
    const day = parts[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

export function getSlugFromFilename(filename: string): string {
  const baseName = filename.split("/").pop()?.replace(".md", "") || "";
  return baseName;
}

export function generatePageUrl(page: number): string {
  if (page === 1) return "/";
  return `/page/${page}`;
}

export function paginatePosts(
  posts: Post[],
  page: number,
  postsPerPage: number = 10,
) {
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    currentPage: page,
    totalPages,
    totalPosts: posts.length,
    startIndex,
    endIndex,
    postsPerPage,
  };
}
