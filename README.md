# Astro Blog for GitHub Pages

A modern, static blog built with [Astro](https://astro.build/) and deployed to GitHub Pages using GitHub Actions.

## Features

- **Static Site Generation**: Fast, SEO-friendly static pages
- **Markdown Posts**: Write posts in Markdown with frontmatter
- **Responsive Design**: Mobile-first, clean design
- **Tag Support**: Organize posts with tags
- **Pagination**: 10 posts per page with navigation
- **Auto-deployment**: Automatic deployment to GitHub Pages via GitHub Actions
- **Post Excerpts**: Automatic excerpt generation with `<!--more-->` support

## Project Structure

```
/
├── public/
│   ├── favicon.svg
│   └── assets/
│       └── images/          # Static images for posts
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro # Base layout with header navigation
│   │   └── PostLayout.astro # Layout for individual posts
│   ├── pages/
│   │   ├── index.astro      # Home page with post list
│   │   ├── about.astro      # About page
│   │   ├── microblog.astro  # Microblog page (placeholder)
│   │   └── posts/
│   │       └── [...slug].astro # Dynamic routes for posts
│   └── posts/               # Markdown post files
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions deployment
```

## Writing Posts

Posts are stored in `src/posts/` as Markdown files with frontmatter:

```markdown
---
title: "Your Post Title"
tags: tag1 tag2 tag3
hidden: false  # Optional: hide from post list
---

Your post content here.

<!--more-->

Content after this comment appears only on the full post page.
```

### Filename Convention

Posts should follow the naming convention: `YYYY-MM-DD-slug.md`

Example: `2024-01-15-my-first-post.md`

### Pagination

The blog automatically paginates posts with 10 posts per page:
- Page 1: `/` (homepage)
- Page 2: `/page/2`
- Page 3: `/page/3`
- And so on...

Pagination includes:
- Post count display ("Showing 1-10 of 36 posts")
- Previous/Next navigation
- Numbered page links
- Responsive design for mobile devices

## Navigation

The site includes a header with:
- **Logo**: Links to home page
- **Home**: Main blog post list
- **Microblog**: Placeholder for future microblog feature
- **About**: About page

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:4321 to view the site.

### Building

```bash
npm run build
```

The built site will be in the `dist/` directory.

### Preview Build

```bash
npm run preview
```

## Deployment

The site is configured to deploy automatically to GitHub Pages when you push to the `main` branch.

### Setup GitHub Pages

1. In your repository settings, go to Pages
2. Set Source to "GitHub Actions"
3. Push to the main branch to trigger deployment

### Configuration

Update `astro.config.mjs` with your GitHub details:

```javascript
export default defineConfig({
  site: "https://your-username.github.io",
  base: "/your-repository-name",
  // ... other config
});
```

## Customization

### Styling

Styles are defined in individual `.astro` files using scoped CSS. Key style locations:

- `src/layouts/BaseLayout.astro`: Global styles and header
- `src/layouts/PostLayout.astro`: Post-specific styles
- `src/pages/index.astro`: Homepage styles (first page)
- `src/pages/page/[page].astro`: Pagination page styles

### Adding Pages

Create new `.astro` files in `src/pages/` directory. They will automatically become routes.

### Customizing Pagination

To change the number of posts per page:
1. Update `postsPerPage` constant in `src/pages/index.astro`
2. Update `postsPerPage` constant in `src/pages/page/[page].astro`
3. Rebuild the site

### Modifying Navigation

Update the navigation in `src/layouts/BaseLayout.astro`:

```astro
<nav class="nav">
  <a href="/">Home</a>
  <a href="/microblog">Microblog</a>
  <a href="/about">About</a>
  <!-- Add your new links here -->
</nav>
```

## Migration from Jekyll

This project was migrated from Jekyll. The following changes were made:

- Removed `layout: post` from all frontmatter (handled by Astro layouts)
- Replaced `{{site.url}}` with direct paths
- Removed `{:.clickableimg}` Jekyll syntax

## Technologies Used

- [Astro](https://astro.build/) - Static site generator
- [GitHub Actions](https://github.com/features/actions) - CI/CD
- [GitHub Pages](https://pages.github.com/) - Hosting
- Modern CSS with CSS Grid and Flexbox
- Responsive design principles

## License

This project is open source and available under the [MIT License](LICENSE).