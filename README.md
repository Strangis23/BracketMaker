# Bracket Maker

A March Madness-style single-elimination bracket app. Add up to 256 teams with names and images, tap to pick winners, and view the full bracket with winners and losers highlighted..

## Features

- Bracket sizes: 2, 4, 8, 16, 32, 64, 128, or 256 teams
- Automatic byes when you add fewer teams than the bracket size
- Each team can have a name and optional image
- Tap-to-pick match play view
- Full bracket overview with winners (green) and losers (red) marked

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This project is set up for GitHub Pages as a project site (`https://<user>.github.io/<repo>/`).

### One-time setup

1. Create a GitHub repository (for example `BracketMaker`).
2. Push this project to the `main` branch.
3. In the repo on GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### Deploy

Every push to `main` runs the workflow in `.github/workflows/deploy.yml` and publishes the built app.

You can also deploy manually from the **Actions** tab using **Deploy to GitHub Pages → Run workflow**.

Your site will be available at:

```text
https://<your-github-username>.github.io/<repo-name>/
```

### Local GitHub Pages preview

The GitHub Actions workflow sets `BASE_PATH` automatically from the repository name. For local preview, change `/BracketMaker/` in `preview:gh-pages` inside `package.json` if your repo name differs.

```bash
npm run preview:gh-pages
```

Then open the URL shown in the terminal (paths will include `/BracketMaker/`).
