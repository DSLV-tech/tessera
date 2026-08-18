# TESSERA

Sei modi di ragionare sullo stesso tabellone, un solo motore. 42 livelli,
**React 19 (API 18+) + TypeScript strict + Vite**, CSS Modules, zero dipendenze
runtime oltre a React.

Il nome: una *tessera* è il singolo tassello di un mosaico — letteralmente la
casella avorio sul tabellone. Un mosaico è tante tessere che compongono un'unica
immagine: la metafora esatta di sei logiche di gioco su un solo tabellone.

**Mobile-first.** L'interfaccia è progettata prima per il telefono: barra di stato
appiccicata in alto con punteggio e pedine sempre visibili durante il gioco, barra
azioni appiccicata in basso raggiungibile col pollice, tabellone che riempie la
larghezza. Da 820px in su il layout diventa a due colonne (tabellone + pannello
laterale). Le aree tattili rispettano i 44px, e i margini rispettano le safe-area
dei notch.

---

## Le sei modalità

| Modalità | Logica | Meccanica distintiva |
| --- | --- | --- |
| **Dominio** | Teoria dei giochi territoriale | Conquista, accerchiamento, territori, moltiplicatori. Massimizzare il punteggio. |
| **Assedio** | Sistemi dinamici / automi | Una marea avanza di una casella dopo ogni pedina posata. Le pedine sono dighe: l'**ordine delle mosse** conta. |
| **Bersaglio** | Aritmetica di precisione | Non si massimizza: si colpisce un punteggio **esatto**. Superarlo è come mancarlo. Si ragiona per scomposizione. |
| **Sigilli** | Logica proposizionale | Predicati booleani (pari/dispari, nessun negativo, primo…) che attivano un moltiplicatore solo se veri sul territorio. |
| **Ponti** | Teoria dei grafi | Solo le città valgono; una rete vale la somma delle città × quante ne collega. Un albero di Steiner travestito. |
| **Simmetria** | Geometria / riflessione | Conta solo una casella la cui **immagine speculare** rispetto all'asse è anch'essa tua. Per un valore fuori asse paghi anche il suo riflesso. |

Le 42 tappe sono interfogliate in un'unica campagna: ogni modalità viene introdotta presto e ripresa più volte a difficoltà crescente.

---

## Memoria e PWA

I progressi (medaglie e livelli sbloccati) sono **persistenti**: `src/state/storage.ts`
li salva in `localStorage` con accesso interamente protetto da `try/catch` e
feature-detection. In un deploy reale ricordano tutto fra le sessioni; in un contesto
dove lo storage è vietato (anteprima sandboxed, quota zero) l'app ricade in memoria
volatile senza mai lanciare eccezioni. Dalla mappa si possono azzerare.

L'app è **installabile e funziona offline**: `public/manifest.webmanifest` con icone la
rende "aggiungibile alla schermata Home", e `public/sw.js` (service worker) mette in
cache l'app-shell per l'uso senza rete. Registrazione guardata: attiva solo su
https/localhost, mai su `file://`.

---

## Architettura

```
src/
  domain/                motore puro, nessuna dipendenza da React
    types.ts             interfacce e union types (LevelMode, Predicate, Objective, Seal, SymmetryAxis…)
    engine.ts             parsing, marea, cattura, territori, predicati, simmetria, punteggio
    levels/              una cartella per modalità (dominio, assedio, bersaglio, sigilli, ponti, simmetria)
      index.ts             assembla la campagna, assegna gli indici, verifica l'ordine
  state/
    gameReducer.ts        riduttore su una sequenza di mosse (serve a rigiocare la marea)
    useGame.ts             hook controller: simulate() è la sola fonte di verità
    useCampaign.ts         avanzamento con memoria persistente
    storage.ts             persistenza best-effort e a prova di sandbox
  audio/                  suono opzionale via Web Audio (nessun asset)
  components/              Board / CellTile / Hud / ResultOverlay / LevelSelect / GameView
tools/
  spec.ts                 verifiche puntuali sulle regole, tutte le modalità
  solve.ts                 solver di validazione (ricerca locale; coppie speculari per la simmetria)
public/
  manifest.webmanifest, sw.js, icone
```

**Un motore solo.** Ogni modalità aggiunge un dato dichiarativo al tabellone
(`blightSources`, `isCity`, `seal`, `symmetry`) o all'obiettivo (`exact` vs `maximize`),
mai un ramo speciale nel calcolo. `simulate()` rigioca la sequenza di mosse, fa avanzare
la marea, calcola cattura, filtra per simmetria, raggruppa i territori, valuta i sigilli,
applica il fattore di rete. Questo rende possibile un solo solver per sei generi diversi.

---

## Brand e tutorial

Il logo (marchio a mosaico + wordmark) è in `brand/`. Il marchio è una tessera
composta da sei tessere, una per modalità. Alla prima partita di ogni modalità
un breve tutorial a step ne spiega la regola chiave; lo stato "modalità viste" è
persistito (con riserva in memoria) e il pulsante `?` in partita lo riapre.

## Comandi

```bash
npm install
npm run dev              # sviluppo
npm run build             # build classica in dist/
npm run build:single       # build in un unico index.html autonomo (dist-single/)
npm run test                # verifiche sulle regole del motore
npm run validate             # test + solver su tutti i 42 livelli
```

Pubblicazione: vedi `DEPLOY.md` (GitHub Pages con workflow incluso, o Vercel zero-config).
