# Pubblicare Tessera

L'app è completamente statica (Vite + React, nessun backend): gira ovunque si possano
servire file statici. `vite.config.ts` usa già `base: './'`, quindi i percorsi sono
relativi e funziona anche in una sotto-cartella (come le project page di GitHub).

## GitHub Pages (automatico, consigliato)

Il workflow `.github/workflows/deploy.yml` è già incluso.

1. Crea il repository su GitHub e fai push del progetto sul branch `main`.
2. Nel repo: **Settings → Pages → Source → "GitHub Actions"**.
3. Ogni push su `main` ricostruisce e pubblica il sito.
   L'URL sarà `https://<utente>.github.io/<nome-repo>/`.

Non serve configurare altro: `base: './'` gestisce la sotto-cartella.

## Vercel (zero-config)

1. Importa il repository su vercel.com (**Add New → Project**).
2. Vercel riconosce Vite in automatico. Se chiede i comandi:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy. Ogni push crea un nuovo deployment; `main` va in produzione.

Nessun `vercel.json` necessario: non ci sono API né routing lato client.

## Scorciatoia: un solo file

`npm run build:single` genera `dist-single/index.html`, un unico file autonomo
(HTML + CSS + JS inline). Puoi:

- rinominarlo `index.html` e committarlo in un repo con Pages attivo su "Deploy from a branch";
- trascinarlo su Netlify Drop, Cloudflare Pages, o qualsiasi hosting statico;
- aprirlo direttamente con doppio clic, anche offline.

## Netlify / Cloudflare Pages

Stessa configurazione di Vercel: build `npm run build`, cartella di pubblicazione `dist`.
