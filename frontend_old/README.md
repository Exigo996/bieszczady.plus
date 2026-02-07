# Bieszczady.plus - Frontend

React 19 + TypeScript + Vite frontend for the Bieszczady regional event discovery platform.

## Project Overview

Bieszczady.plus is a community-driven platform showcasing events, local producers, and craftspeople in the Bieszczady region of Podkarpackie, Poland.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **TanStack Query** - Server state management and caching
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **i18next** - Internationalization (PL/EN/UK)
- **Leaflet** + **react-leaflet** - Interactive maps
- **date-fns** - Date formatting
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── HeroSplitScreen.tsx
│   │   ├── events/          # Event-related components
│   │   │   ├── EventCard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── HeroSection.tsx
│   │   ├── organizers/      # Organizer components
│   │   │   ├── OrganizerEventsSection.tsx
│   │   │   └── ProducerCard.tsx
│   │   └── products/        # Product components (planned)
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── MapPage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── OrganizerPage.tsx
│   ├── api/                 # API client
│   │   ├── client.ts        # Axios instance
│   │   ├── events.ts        # Event API calls
│   │   ├── organizers.ts    # Organizer API calls
│   │   └── index.ts
│   ├── contexts/            # React contexts
│   │   ├── LanguageContext.tsx
│   │   └── FiltersContext.tsx
│   ├── types/               # TypeScript types
│   │   ├── event.ts
│   │   └── organizer.ts
│   ├── translations/        # i18n translations
│   │   └── index.ts         # PL/EN/UK translations
│   ├── data/                # Static data
│   │   └── mockEvents.ts
│   ├── assets/              # Static assets
│   ├── App.tsx              # Root component
│   ├── App.css              # Global styles
│   ├── index.css            # Tailwind imports
│   └── main.tsx             # Entry point
├── public/                  # Static files
│   └── icons/               # PWA icons
├── index.html               # HTML template
├── package.json
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
└── eslint.config.js         # ESLint rules
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# or with yarn
yarn install
```

### Development

```bash
# Start development server
npm run dev

# or with yarn
yarn dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
```

For production:

```env
VITE_API_URL=https://api.bieszczady.plus/api
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Main page with events listing |
| `/mapa` | MapPage | Interactive map with events |
| `/produkty` | ProductsPage | Local market page |
| `/organizator/:slug` | OrganizerPage | Organizer profile page |

## Key Features

### Internationalization (i18n)

The app supports three languages: Polish (default), English, and Ukrainian.

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Change language
i18n.changeLanguage('en');
```

### API Client

Using TanStack Query for server state management:

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/api/events';

function EventsList() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
  // ...
}
```

### Filters Context

Global filter state managed via React Context:

```typescript
import { useFilters } from '@/contexts/FiltersContext';

const { filters, setFilters } = useFilters();
```

## Styling

The app uses Tailwind CSS v4 for styling. Styles are organized using:

- Utility classes for layout and spacing
- `@apply` directive for reusable component styles
- CSS modules for component-specific styles

### Mobile-First Breakpoints

- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `≥ 1024px`

## Accessibility

The app follows WCAG 2.1 AA guidelines:

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Minimum 44x44px touch targets
- Color contrast compliance

## Building for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

The production build will be in the `dist/` directory.

## Docker

The frontend includes Dockerfiles for containerization:

- `Dockerfile` - Development build
- `Dockerfile.prod` - Production build (uses `serve`)

## Additional Documentation

- [Main README](../README.md) - Project overview
- [CLAUDE.md](../CLAUDE.md) - AI assistant guide
- [PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) - File structure
- [DOCKER-GUIDE.md](../DOCKER-GUIDE.md) - Docker setup
- [COOLIFY-DEPLOYMENT.md](../COOLIFY-DEPLOYMENT.md) - Deployment guide

## License

MIT License - See main project LICENSE file.
