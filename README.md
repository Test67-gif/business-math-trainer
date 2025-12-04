# Business Mental Math Trainer

A mobile-first web app for practicing business-style mental math—percentages and basic arithmetic with large numbers.

## Features

- **Two Question Types:**
  - **Accurate Math** – Exact answer required
  - **Estimated Math** – Answer is correct if within ±10%

- **Three Difficulty Levels:** Easy, Medium, Tough

- **Two Modes:**
  - **Timed Mode** – Race against the clock (1-5 minutes)
  - **Practice Mode** – Set number of questions, take your time

- **No signup required** – Just open and start practicing
- **Works offline** – Fully client-side, no backend needed
- **Mobile-first design** – Optimized for phones and tablets

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Enable GitHub Actions as the source
4. Push to `main` branch - deployment will trigger automatically

The included `.github/workflows/deploy.yml` handles automatic deployment.

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Vercel

1. Import your GitHub repository
2. Vercel auto-detects Vite settings
3. Deploy!

## Tech Stack

- React 18
- TypeScript
- Vite
- Pure CSS (no frameworks)

## Project Structure

```
src/
├── components/
│   ├── HomeScreen.tsx      # Landing page
│   ├── SetupScreen.tsx     # Session configuration
│   ├── QuizScreen.tsx      # Question display & input
│   └── ResultsScreen.tsx   # Session results & review
├── styles/
│   └── index.css           # All styles (mobile-first)
├── types.ts                # TypeScript interfaces
├── questionGenerator.ts    # Question generation engine
├── App.tsx                 # Main app component
└── main.tsx               # Entry point
```

## Question Types

### Easy
- Simple percentages: 5%, 10%, 20%, 25%, 50%
- Numbers up to 100,000
- Basic multiplication/division

### Medium
- Complex percentages: 7%, 8%, 12%, 17%, 19%
- Numbers up to 10,000,000
- Revenue/margin calculations

### Tough
- Any percentage 1-30%
- Numbers up to 1,000,000,000+
- Multi-step business calculations

## License

MIT

