# Audio Bible

A personal Bible listening web app. Paste a YouTube playlist URL containing Bible readings, import the metadata, and listen with an audio-first player — all in your browser, progress saved locally.

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd audio-bible
npm install
```

### 2. Get a YouTube Data API v3 key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Navigate to **APIs & Services → Library**
4. Search for **YouTube Data API v3** and enable it
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. (Recommended) Restrict the key to the YouTube Data API v3 and your domain

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to use

1. Find a YouTube playlist of Bible readings (e.g. search "NIV Audio Bible playlist")
2. Copy the playlist URL from YouTube
3. Paste it into the import field on the home screen
4. Press **Import Playlist** — the app fetches metadata and saves it locally
5. Open the playlist and tap any track to play

---

## Features

- **Import** any public YouTube playlist
- **Audio-first player** — sticky bottom bar with play/pause, prev/next, speed control
- **Bible parsing** — automatically detects book and chapter from track titles
- **Book/chapter navigation** — browse by book when Bible data is detected
- **Progress tracking** — mark tracks as listened, progress bar per playlist
- **Resume playback** — remembers your place and timestamp across sessions
- **Search** — filter tracks by title or Bible book
- **Local-first** — all data stored in `localStorage`, no account needed

---

## App limitations

- Requires a public playlist — private or unlisted playlists will fail
- YouTube API quota: free tier allows ~10,000 units/day. Fetching a 1000-track playlist costs ~20 units. Normal usage is well within limits.
- Playback uses the official YouTube IFrame Player API. The video renders in a hidden 1×1px iframe — this is intentional and compliant (see below).
- Progress bar is best-effort — YouTube's IFrame API doesn't expose reliable duration before a video starts buffering.
- Playback speed options depend on what YouTube allows for each video.

---

## Why this app is YouTube-compliant

This app:
- ✅ Uses the **YouTube Data API v3** for all metadata (no scraping)
- ✅ Uses the **official IFrame Player API** for playback (no media extraction)
- ✅ Streams video directly from YouTube's servers (no proxying or caching of media)
- ✅ Preserves the YouTube player in the DOM at all times during playback
- ✅ Does not download, transcode, or rehost any audio or video

The "audio-first" feel is achieved by hiding the video visually (1px hidden div) while keeping the IFrame in the DOM, which is the same technique used by many compliant YouTube-based audio apps. YouTube's Terms of Service prohibit extraction/download of content but do not prohibit embedding with hidden video UI.

---

## Architecture

```
app/                  Next.js App Router pages
components/           React UI components
lib/                  Pure utilities (YouTube API, storage, Bible parser)
hooks/                React hooks
types/                TypeScript interfaces
```

### Upgrading to Supabase / Xano

The storage layer is fully abstracted in `lib/playlist-storage.ts` and `lib/playback-storage.ts`. To migrate from localStorage to a backend:

1. Replace the `load*` / `save*` functions with API calls
2. Add authentication (Supabase Auth or similar)
3. The UI components need no changes
