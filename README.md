# imtihan.app

The public website for the Imtihan app: landing page, legal pages and the pages the app links to.
Next.js, exported as static files and hosted on Vercel, which deploys every push to `main`.
The admin portal is a separate project (`imtihan_web`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the site to out/
```

## Pages

| Address | What it is |
|---|---|
| `/` | Landing page |
| `/privacy`, `/terms`, `/delete-account` | Legal pages, English and Urdu |
| `/p/<code>`, `/parent` | Where the app's parent links land. Says the report is coming soon |
| `/r/<partner-code>` | A partner's invite link: shows the code to enter in the app |
| `/testers` | How to join the closed test: Google Group, Play opt-in, install |
| `/download` | Link for posters and QR codes |
| `/upgrade` | Linked from the app's "ask a parent" message. Says the app is free |
| `/contact` | Support email |

`/p/…` and `/r/…` are not real folders: `vercel.json` serves the `/p` and `/r` pages for them.
`npm run dev` does not do that, so test those links on a Vercel preview deployment.

## Things to change in one place

`lib/site.js` holds the support email, the list of boards and which classes are live, and
`APP_IS_PUBLIC`. While that is `false`, every download button invites people to `/testers`. Set it to `true`
when the Play Store listing is public.

## Languages

English is the default, like the app. Every piece of text is written with `<T ur="…" en="…" />`, which puts both
languages in the page; CSS hides the one not chosen, and the header button saves the choice.
The legal pages always show both languages.

## Legal text and screenshots

`content/legal/*.html`, `public/screens/`, the icon and the share image come from the app repo.
After changing them there, run:

```bash
node scripts/import-assets.mjs ../../imtihan_mobile_app
```
