# Built with Golem DB — Portfolio Starter

Next.js (App Router) + Tailwind starter to showcase projects using **Golem DB**.

## Quick start
```bash
pnpm i # or npm i / yarn
pnpm dev
# visit http://localhost:3000
```

## Add a project
- Create a JSON in `content/projects/your-project.json` using the shape in `lib/projects.ts`.
- Add screenshots to `public/images/` and reference them in the `screens` array.

## Pages
- `/` — gallery with filters
- `/[slug]` — project detail
- `/submit` — helper to generate JSON skeleton
