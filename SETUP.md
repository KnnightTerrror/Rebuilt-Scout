# REBUILT Scout: website setup

This folder is the whole website. It has no server code, so any free static host works.
Setup takes about 20 minutes, done once by one person (usually the head scout or a mentor).

## 1. Put the site online (GitHub Pages, free)

1. Sign in at https://github.com (or create a free account).
2. Click **New repository**. Name it something like `scouting`. Make it **Public**, then **Create repository**.
3. Click **uploading an existing file**, then drag in **every file in this folder**. Click **Commit changes**.
4. Go to **Settings → Pages**. Under *Branch*, pick `main` and `/ (root)`, then **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/scouting/`.

Other free hosts work too: Netlify, Cloudflare Pages or Firebase Hosting. Just upload this folder.

At this point the app works, but each phone keeps its own data. The head scout can collect
reports with QR codes (More → QR transfer). For live syncing, do step 2.

## 2. Turn on live team sync (Firebase, free)

1. Go to https://console.firebase.google.com and click **Create a project**. Analytics can be turned off.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**
   Scouts don't make accounts. The app signs each device in anonymously.
3. **Build → Firestore Database → Create database.** Pick a location near you and **Start in production mode**.
4. In Firestore, open the **Rules** tab. Replace everything with the contents of `firestore.rules`, then click **Publish**.
5. Click the gear icon → **Project settings**. Under *Your apps*, click the web icon `</>`.
   Register the app (no hosting needed) and copy the `firebaseConfig` values.
6. Open `config.js`, replace `firebase: null` with your values, and save:

   ```js
   window.SCOUT_CONFIG = {
     firebase: {
       apiKey: "AIza...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project",
       appId: "1:123:web:abc"
     }
   };
   ```

   These values are not secret. Firebase expects them to be public.
7. Upload the edited `config.js` to your GitHub repository, replacing the old one.

## 3. Create your team workspace

1. Open the site, go to **More → Setup → Team sync**, and click **Create team workspace** (head scout only, once).
2. Click **Copy link** and send the invite link to your team chat.
3. Each scout opens the link once on their phone. It remembers the team after that.

The team code in the link works like a shared password. Anyone with it can read and add your
data, so only share it with your team. To start over with a new code, everyone taps
**Leave this workspace** and you create a new one.

## 4. Before each event

- **More → Setup → Event code:** use The Blue Alliance event key, e.g. `2026miket`.
- **More → Setup → Our team:** enter your team number and a TBA read key from
  https://www.thebluealliance.com/account (free; only one person needs to enter it).
- **Matches → Schedule → Import from TBA** once the schedule is posted (or paste it by hand).
- **Matches → Scouts:** enter your scout roster. Each scout's next robot then appears on their Scout tab.
- Have every scout open the site once with internet, then install it:
  - iPhone/iPad: Share → **Add to Home Screen**
  - Android / laptop (Chrome or Edge): menu → **Install app**

## At the event

- The app opens with no internet after the first visit.
- Reports made offline are saved on the phone and upload when it reconnects.
- With no internet at all, use **More → QR transfer**. Scouts show codes and the head scout scans them.

## Free-plan limits

Firebase's free Spark plan allows 50,000 reads and 20,000 writes per day. Opening the app reads
the current event's reports once. A 60-team regional with 20 scouts stays well under the limit.
If you ever hit it, sync pauses until the next day (no charge) and reports wait on each device.

## Updating the app

Replace `index.html` in your repository with a new version. Everyone gets it the next time they
open the app with internet. Don't replace `config.js` unless you mean to change the Firebase settings.
