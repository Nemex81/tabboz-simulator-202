# Sistema di Temi - Tabboz Simulator 2026

## Come Funziona

Il sistema di temi permette di cambiare l'aspetto visivo dell'intera applicazione in tempo reale. Ci sono 3 temi disponibili:

1. **Default (Neon Blu)** - Tema classico con sfondo navy scuro, accenti teal e azzurro
2. **Dark (Nero Viola)** - Tema scuro con nero profondo e accenti viola intensi
3. **Green (Ganja Style)** - Tema ispirato alla natura con marrone terra e verde ganja

## Implementazione Tecnica

### 1. Definizione dei Temi (index.css)

I temi sono definiti usando l'attributo HTML `data-theme` sull'elemento `<html>`:

```css
html[data-theme="default"],
html:not([data-theme]) {
  --background: oklch(0.12 0.03 255);
  --foreground: oklch(0.88 0.02 255);
  /* ... altre variabili CSS ... */
}

html[data-theme="dark"] {
  --background: oklch(0.08 0.01 280);
  --foreground: oklch(0.92 0.02 280);
  /* ... altre variabili CSS ... */
}

html[data-theme="green"] {
  --background: oklch(0.15 0.03 110);
  --foreground: oklch(0.90 0.02 110);
  /* ... altre variabili CSS ... */
}
```

### 2. Applicazione del Tema

Il tema viene applicato in due modi:

#### A) Durante la Creazione del Personaggio (SchoolSelection.tsx)

```typescript
const [selectedTheme, setSelectedTheme] = useState<ThemeVariant>('default')

useEffect(() => {
  const htmlElement = document.querySelector('html')
  if (htmlElement) {
    htmlElement.setAttribute('data-theme', selectedTheme)
  }
}, [selectedTheme])
```

Il giocatore può vedere il tema in anteprima mentre crea il personaggio.

#### B) Durante il Gioco (App.tsx)

```typescript
const [currentTheme, setCurrentTheme] = useKV<ThemeVariant>('tabboz-theme', 'default')

useEffect(() => {
  const htmlElement = document.querySelector('html')
  if (htmlElement) {
    htmlElement.setAttribute('data-theme', currentTheme)
  }
}, [currentTheme])
```

Il tema scelto viene salvato usando `useKV` per persistere tra le sessioni.

### 3. Cambio Tema Durante il Gioco

Il giocatore può cambiare tema in qualsiasi momento dal **Pannello di Controllo** (tab "Controllo"):

1. Vai alla tab "Controllo" (⚙️)
2. Trova la sezione "SELETTORE TEMA"
3. Clicca su uno dei 3 temi disponibili
4. Il tema viene applicato immediatamente a tutta l'UI

### 4. Variabili CSS Utilizzate

Ogni tema definisce le seguenti variabili CSS:

- `--background` - Sfondo principale della pagina
- `--foreground` - Colore del testo principale
- `--card` - Sfondo delle card
- `--card-foreground` - Testo sulle card
- `--primary` - Colore primario (azioni principali)
- `--secondary` - Colore secondario
- `--accent` - Colore di accento (evidenziazioni)
- `--destructive` - Colore per azioni pericolose
- `--muted` - Colore attenuato per UI secondaria
- `--border` - Colore dei bordi
- `--input` - Bordo degli input
- `--ring` - Colore del focus ring

Queste variabili vengono mappate a classi Tailwind tramite il blocco `@theme` in index.css:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
```

### 5. Utilizzo nei Componenti

I componenti utilizzano le classi Tailwind che fanno riferimento alle variabili del tema:

```tsx
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Azione Primaria
  </Button>
  <Card className="bg-card text-card-foreground border-border">
    Contenuto Card
  </Card>
</div>
```

Quando il tema cambia, tutte queste classi si aggiornano automaticamente!

## Caratteristiche dei Temi

### Default (Neon Blu)
- **Atmosfera**: Futuristica, stile Popomundo/anni 2000
- **Colori principali**: Navy blu scuro, teal, azzurro, oro
- **Best per**: Esperienza classica del gioco

### Dark (Nero Viola)
- **Atmosfera**: Oscura, misteriosa, elegante
- **Colori principali**: Nero profondo, viola intenso, rosa neon
- **Best per**: Sessioni notturne, riduce affaticamento occhi

### Green (Ganja Style)
- **Atmosfera**: Rilassata, naturale, chill
- **Colori principali**: Marrone terra, verde ganja, verde lime, oro
- **Best per**: Vibe rilassato, estetica naturale

## File Coinvolti

1. **index.css** - Definizioni dei 3 temi
2. **App.tsx** - Applicazione del tema durante il gioco
3. **SchoolSelection.tsx** - Selezione tema durante creazione personaggio
4. **ThemeSelector.tsx** - UI per cambiare tema
5. **index.html** - Attributo data-theme iniziale
6. **types.ts** - Tipo TypeScript `ThemeVariant`

## Debug

Se il tema non si applica:

1. Verifica che `html` abbia l'attributo `data-theme` corretto:
   ```javascript
   document.querySelector('html').getAttribute('data-theme')
   ```

2. Verifica che le variabili CSS siano definite:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--background')
   ```

3. Controlla che index.css venga caricato DOPO main.css (ordine imports in main.css)
