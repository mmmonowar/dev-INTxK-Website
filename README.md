# The Polymod Framework

A terminal-styled static site for **The Polymod Framework** — a modular support system for solo, early-stage and young entrepreneurs. Built with [Hugo](https://gohugo.io/) and deployed to GitHub Pages.

**Live site:** <https://intxk.github.io/thepolymodframework/>

Publishing model: **push to `main` → auto-build → auto-deploy.** No build servers, no databases, no manual deployment.

---

## Table of contents

- [Project structure](#project-structure)
- [Local development](#local-development)
- [Writing a post](#writing-a-post)
- [Post lifecycle](#post-lifecycle)
  - [Publish a post](#publish-a-post)
  - [Update a post](#update-a-post)
  - [Remove a post](#remove-a-post)
- [Tags & archives](#tags--archives)
- [Navigation & theme](#navigation--theme)
- [Editing the homepage](#editing-the-homepage)
- [Configuration](#configuration)
- [Deployment](#deployment)

---

## Project structure

```
.
├── .github/workflows/hugo.yml   # CI/CD: builds & deploys on every push to main
├── assets/css/main.css          # all styling (terminal theme, posts, nav)
├── assets/js/hero-typing.js     # hero typed-text cursor animation
├── content/
│   ├── _index.md                # home page front matter (title only)
│   ├── posts/                   # BLOG: one folder per post
│   │   └── <node> <title>/
│   │       ├── post.md          # the post (committed — you author this)
│   │       └── ...              # attachments (images, PDFs, etc.)
│   └── sections/                # homepage content cards (editable)
│       ├── 01-chaos.md
│       ├── 02-versatile.md
│       ├── 03-solutions.md
│       └── 04-cta.md
├── layouts/                     # Hugo templates (nav, posts, tags, base)
├── scripts/prepare-posts.ps1    # post.md → index.md + injects date from node
├── hugo.toml                    # site config (URL, subtitles, brand mark)
└── .gitignore
```

---

## Local development

**Prerequisites**

- [Hugo](https://gohugo.io/installation/) **extended edition, v0.164.0** (used by CI; pin the same version locally)
- PowerShell 5.1+ or PowerShell 7 (`pwsh`) — Windows ships PowerShell 5.1 by default

**Clone & preview**

```powershell
git clone https://github.com/INTxK/thepolymodframework.git
cd thepolymodframework
pwsh ./scripts/prepare-posts.ps1   # or: powershell -File ./scripts/prepare-posts.ps1
hugo server -D                     # -D includes draft posts in the preview
```

Open <http://localhost:1313>.

Why the `prepare-posts.ps1` step? Hugo renders each post folder as a *leaf bundle*, which requires an `index.md` entry point. You author `post.md`; the script copies it to `index.md` and injects a `date` field derived from the `node` field. `index.md` is git-ignored and regenerated on every build (including CI), so it never needs to be committed or manually edited.

> Note: `hugo server` works without the script, but the injected `date` (from `node`) is what sorts posts newest-first, so run the script for a faithful preview.

---

## Writing a post

Each post lives in its own folder under `content/posts/`:

```
content/posts/2026-08-03-07-30-00 hello-polymod/
├── post.md
└── sample.txt
```

### Folder naming

```
<node> <title>
```

- `<node>` — unique id in `YYYY-MM-DD-hh-mm-ss` form (required)
- `<title>` — URL slug; spaces are converted to dashes by Hugo

The folder name above produces the URL:

```
/posts/2026-08-03-07-30-00-hello-polymod/
```

### Front matter

`post.md` looks like this:

```markdown
---
title: "Hello, Polymod"
node: "2026-08-03-07-30-00"
tags:
  - meta
  - hello
summary: "First post to validate the publishing pipeline."
draft: true
---

Your post body in standard Markdown goes here.
```

| Field     | Required | Purpose                                                        |
|-----------|----------|----------------------------------------------------------------|
| `title`   | yes      | Post title (shown in the nav list and post page).              |
| `node`    | yes      | Unique id `YYYY-MM-DD-hh-mm-ss`. Drives the displayed date, newest-first ordering, and the URL. Must match the folder-name prefix. |
| `tags`    | no       | YAML list. Automatically creates archive pages under `/tags/`. |
| `summary` | no       | One-line description shown beneath the title on the posts page. |
| `draft`   | no       | Set `draft: true` to keep the post unpublished. Remove the field to publish. |
| `license` / `license_url` / `license_notice` | no | Per-post license override for the footer badge (name, link, notice). Omit to inherit the site default; set `license: ""` to hide the footer. |
| `cite` | no | Set `cite: false` to hide the "Cite this post" box. |
| `cite_author` | no | Full author name used in citations (for guest posts / different authors). Defaults to the site author. |
| `cite_key` | no | Stable BibTeX key. Defaults to `lastnameYYYYfirstword-of-title`. |

### Body & attachments

The body is standard Markdown — headings, code, bold/italic, lists, quotes, tables all work.

Attachments (images, PDFs, archives) sit in the same folder and are linked **relative to the post**:

```markdown
[Download the sample](./sample.txt)
```

You can mix every kind of file and reference it the same way.

---

## Post lifecycle

Three operations, all follow the same rhythm: **change files → commit → push → the site updates itself.**

### Publish a post

1. Create the folder and files:

   ```powershell
   cd content/posts
   New-Item -ItemType Directory -Path "2026-08-03-07-30-00 hello-polymod"
   ```

2. Write `post.md` (see [Writing a post](#writing-a-post)); leave `draft` out to make it live.
3. Verify locally: `pwsh ../../scripts/prepare-posts.ps1` then `hugo server -D` from the repo root.
4. Commit and push:

   ```powershell
   git add content/posts/"2026-08-03-07-30-00 hello-polymod"
   git commit -m "Add post: hello-polymod"
   git push origin main
   ```

5. The deploy workflow runs; your post appears at `/posts/<node>-<title>/` and at the top of `/posts/`.

### Update a post

1. Edit `post.md` (fix a typo, add content, change `tags`/`summary`).
2. Commit and push:

   ```powershell
   git add -A
   git commit -m "Update post: hello-polymod"
   git push origin main
   ```

The regenerated `index.md` is picked up automatically — you never touch it. Change the folder name (the `node` prefix) if you want to change the post's URL/date.

### Remove a post

1. Delete the whole folder:

   ```powershell
   git rm -r "content/posts/2026-08-03-07-30-00 hello-polymod"
   git commit -m "Remove post: hello-polymod"
   git push origin main
   ```

The post (and its attachment links) disappear from the site on the next deploy.

> **Unpublished drafts:** if you're not ready to delete a post but don't want it visible, set `draft: true` instead of removing it. Drafts are never deployed; flip the flag back to re-publish.

---

## Tags & archives

Tags need zero configuration. Add `tags` to the front matter and Hugo generates:

- `/tags/` — a cloud of every tag with a usage count
- `/tags/<tag>/` — an archive listing all posts carrying that tag

Each post page shows its tag chips, linking back to the archive.

---

## Citing posts

Every post renders a **"Cite this post"** box with ready-made **APA 7**, **MLA 9**, and **BibTeX** citations and a copy button for each. Citations are generated from the post's `node` date, title, site author, and `baseURL`, so they stay correct automatically.

Per-post front matter overrides: `cite: false` to hide the box, `cite_author` for a different author, `cite_key` for a stable BibTeX key.

---

## Navigation & theme

- A compact nav strip (`~ home posts`) appears at the top of every page; the active page is highlighted.
- Posts render in a wrapped, readable column that stays centered on wide screens and collapses on mobile.
- Everything uses the site's terminal aesthetic (monospace, bracket styles) defined in `assets/css/main.css`.
- The hero terminal types the site's taglines character-by-character with a blinking block cursor. Which sentences are typed, and how fast, is set via `[params] hero_cursor_*` in `hugo.toml` (see [Configuration](#configuration)).

There is a sample post at `content/posts/2026-08-03-07-30-00 hello-polymod/` — useful as a reference, and safe to delete whenever you want.

---

## Editing the homepage

The homepage content lives in `content/sections/`, one Markdown file per card, ordered by the `weight` field:

```markdown
---
title: "Designed for Entrepreneurs Navigating Chaos"
weight: 1
---

Your section body in Markdown…
```

To add a section: create `content/sections/05-your-section.md` with `weight: 5` (or any number to slot into the order). To reorder, adjust `weight` values. To remove, delete the file. Push to deploy.

---

## Configuration

Site-wide settings live in `hugo.toml`:

| Key                    | What it controls                                 |
|------------------------|--------------------------------------------------|
| `baseURL`              | The live site URL (change if the site moves).    |
| `[params] author`      | Author name (shown in page footers/metadata).    |
| `[params] company`     | Company name.                                    |
| `[params] subtitle_line1` / `subtitle_line2` | Hero taglines on the homepage.      |
| `[params] hero_cursor_lines` | Sentences typed one-by-one in the hero terminal (each item is typed character-by-character, then erased before the next). Sensible UX: 2–5 lines of 20–80 chars. |
| `[params] hero_cursor_lines_animation_speed` | Seconds per character typed (e.g. `0.05` = 50ms/char). Sensible UX: 0.03–0.08 (snappy) to 0.1–0.15 (deliberate). |
| `[params] hero_cursor_between_lines_animation_speed` | Pause in seconds between finishing one line and typing the next. Sensible UX: 0.5–1.5 (steady) to 2–3 (dramatic). |
| `[params] hero_cursor_cycle_pause` | Extra pause in seconds after a full pass through all lines before the loop restarts. Sensible UX: 1–3 (steady) to 4–6 (dramatic). Defaults to `hero_cursor_between_lines_animation_speed` when unset. |
| `[params] brand_mark`  | ASCII brand mark rendered in the hero.           |
| `[params] cc_license_name` | Default Creative Commons license name shown under each post. |
| `[params] cc_license_url` | Link for the post license badge.                |
| `[params] cc_license_notice` | Default notice text under each post.          |
| `[params] copyright_line` | Site footer copyright. Empty = the default `© <year> <author> | <company>` All Rights Reserved line. |
| `[params.citation] apa_author` | APA-formatted author used in "Cite this post" (e.g. `"Monowar, M. M."`). Empty = auto-derived from `author`. |
| `[params.citation] site_name` | Site name shown in citations. Empty = `title`. |
| `[taxonomies] tag`     | Enables the tag system — leave as-is.            |

`brand_mark` is a TOML literal string; backslashes inside it must be doubled (`\\`) or Hugo will reject the file.

---

## Deployment

Deployment is handled entirely by `.github/workflows/hugo.yml`, which runs on every push to `main` (and can be triggered manually from the Actions tab):

1. **Checkout** the repo
2. **Setup Hugo** (v0.164.0, extended)
3. **Prepare post bundles** — runs `pwsh ./scripts/prepare-posts.ps1` (PowerShell is preinstalled on GitHub runners)
4. **Build** — `hugo --minify`
5. **Upload** the `public/` artifact
6. **Deploy** to GitHub Pages

Track a run with `gh run watch`, or watch it live under **Actions → "Deploy Hugo site to Pages"**. The deployment environment URL is set from the workflow and displayed on the Actions page.

**To move the site to another repository or domain:** update `baseURL` in `hugo.toml`, and in GitHub enable Pages (**Settings → Pages → Build and deployment → GitHub Actions**).
