# Bracket Maker

A March Madness-style single-elimination bracket app. Add up to 256 teams with names and images, tap to pick winners, and view the full bracket with winners and losers highlighted.

Available as a web app and as a native **Android app** with banner ads at the bottom.

## Features

- Bracket sizes: 2, 4, 8, 16, 32, 64, 128, or 256 teams
- Automatic byes when you add fewer teams than the bracket size
- Each team can have a name and optional image
- Tap-to-pick match play view
- Full bracket overview with winners (green) and losers (red) marked
- Android app with AdMob banner ads pinned to the bottom

## Run locally (web)

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build (web)

```bash
npm run build
npm run preview
```

## Android app

This project uses [Capacitor](https://capacitorjs.com/) to wrap the web UI as a native Android app. Banner ads use [@capacitor-community/admob](https://github.com/capacitor-community/admob).

### Prerequisites

- [Android Studio](https://developer.android.com/studio) (includes Android SDK)
- JDK 17+

### Build and run

```bash
npm install
npm run build:android
npm run open:android
```

In Android Studio, choose a device or emulator and click **Run**.

If `open:android` cannot find Android Studio (common with JetBrains Toolbox installs), set:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH="$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"
```

After changing the web app, rebuild and sync:

```bash
npm run build:android
```

### AdMob setup

The project ships with **Google test ad IDs** so you can run the app immediately. Before publishing to the Play Store, replace them with your own AdMob IDs:

1. Create an app and banner ad unit in [AdMob](https://admob.google.com/).
2. Set your app ID in `android/app/src/main/res/values/strings.xml` (`admob_app_id`).
3. Set your banner ad unit ID in `src/ads/adConfig.ts` (`BANNER_AD_ID`).
4. Set `isTesting: false` and remove `initializeForTesting: true` in `src/ads/useBannerAd.ts`.

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
