/** Contenuto dell'informativa privacy/cookie, condiviso dall'overlay in-app. */
export interface LegalSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export const PRIVACY_UPDATED = 'Agosto 2026';
export const DATA_CONTROLLER = 'DSLV.tech (Digital Solving)';

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    heading: 'In breve',
    paragraphs: [
      'Tessera è un gioco che funziona interamente sul tuo dispositivo. Non raccoglie dati personali, non usa cookie di profilazione, non ti traccia e non invia informazioni a terzi.',
    ],
  },
  {
    heading: 'Cosa viene salvato sul tuo dispositivo',
    paragraphs: [
      'Per farti ritrovare i progressi e le preferenze, il gioco salva alcune informazioni nell’archivio locale del browser (localStorage), non tramite cookie:',
      '• tessera:v1 — livelli superati e medaglie;\n• tessera:sound — preferenza audio (attivo/spento);\n• tessera:seen — quali tutorial hai già visto;\n• tessera:legal — la tua presa visione di questa informativa.',
      'Sono dati tecnici, necessari al funzionamento del gioco, che restano sul tuo dispositivo: non vengono mai trasmessi.',
    ],
  },
  {
    heading: 'Cookie',
    paragraphs: [
      'Il gioco non installa cookie, né tecnici né di profilazione o di terze parti. Usa soltanto l’archivio locale descritto sopra, indispensabile per ricordare i progressi.',
    ],
  },
  {
    heading: 'Base giuridica (GDPR)',
    paragraphs: [
      'La memorizzazione locale è strettamente necessaria per erogare il servizio che hai richiesto (giocare e conservare i progressi): ai sensi della Direttiva ePrivacy non richiede consenso. Non trattiamo dati personali per finalità ulteriori, quindi non c’è profilazione né consenso da prestare.',
    ],
  },
  {
    heading: 'I tuoi diritti e come cancellare i dati',
    paragraphs: [
      'Poiché i dati risiedono solo sul tuo dispositivo, ne hai il pieno controllo. Puoi cancellarli in qualsiasi momento con il pulsante “Azzera” nella schermata iniziale, oppure svuotando i dati del sito dalle impostazioni del browser.',
      'Restano validi i diritti previsti dagli artt. 15–22 GDPR (accesso, rettifica, cancellazione, portabilità, opposizione): dato che non conserviamo alcun dato lato server, sono soddisfatti direttamente da te sul dispositivo.',
    ],
  },
  {
    heading: 'Hosting',
    paragraphs: [
      'Se utilizzi una versione pubblicata online, il fornitore di hosting (ad es. GitHub Pages o Vercel) può registrare log tecnici di connessione (come indirizzo IP e user-agent) per erogare e proteggere il servizio, secondo le proprie informative. Il gioco in sé non crea questi log né vi accede.',
    ],
  },
  {
    heading: 'Titolare e contatti',
    paragraphs: [
      `Titolare del trattamento: ${DATA_CONTROLLER}. Per esercitare i tuoi diritti o per qualsiasi domanda, scrivi a: [inserisci qui l’indirizzo email di contatto].`,
      `Ultimo aggiornamento: ${PRIVACY_UPDATED}.`,
    ],
  },
];
