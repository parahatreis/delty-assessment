# Frontend

React + Vite frontend application for delty-assessment.

## Tech Stack

- React 19
- TypeScript
- Vite
- TailwindCSS 4
- Radix UI Components
- React Query (TanStack Query)
- Axios
- React Router
- Zustand (State Management)

## Prerequisites

- Node.js 18+
- Yarn 3.6.4+

## Development

1. Install dependencies:
```bash
yarn install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

4. Start development server:
```bash
yarn dev
```

The app will be available at `http://localhost:5173`

## Build

### Development Build
```bash
yarn build
```

### Production Build
```bash
yarn build:prod
```

Build output will be in the `dist/` directory.

## Preview Production Build

```bash
yarn preview
```

## Type Checking

```bash
yarn type-check
```

## Linting

```bash
yarn lint
```

## AWS Amplify Deployment

### Automatic Deployment

Amplify can automatically deploy from your GitHub repository:

1. Connect repository to AWS Amplify Console
2. Amplify will detect `amplify.yml` configuration
3. Set environment variables in Amplify Console:
   - `VITE_API_URL`: Your App Runner backend URL
   - `VITE_ENV`: `production`

### Manual Deployment

Using Amplify CLI:

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:3001/api`)
- `VITE_ENV`: Environment name (default: `development`)

**Note**: All environment variables must be prefixed with `VITE_` to be accessible in the frontend.

## Build Optimizations

- Code splitting for vendor chunks
- Tree shaking for unused code
- Minification with Terser
- Source maps for debugging
- Drop console logs in production

## Project Structure

```
frontend/
├── src/
│   ├── api/          # API client and endpoints
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities
│   ├── pages/        # Page components
│   ├── styles/       # Global styles
│   ├── App.tsx       # App root
│   └── main.tsx      # Entry point
├── public/           # Static assets
├── amplify.yml       # Amplify build configuration
├── vite.config.ts    # Vite configuration
└── package.json
```

## Deployment Checklist

- [ ] Environment variables set in Amplify Console
- [ ] Backend API URL configured
- [ ] Build succeeds locally
- [ ] Production build tested with `yarn preview`
- [ ] CORS configured on backend for frontend domain
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Amplify)

## Troubleshooting

### Build Fails on Amplify

- Check Node.js version in Amplify Console (should be 18+)
- Verify all environment variables are set
- Check build logs for specific errors

### API Connection Issues

- Verify `VITE_API_URL` is correct
- Check backend CORS configuration
- Ensure App Runner service is running

### Blank Page After Deployment

- Check browser console for errors
- Verify environment variables are set
- Check that assets are being served correctly
