# Vercel Serverless Function for Hydrogen

This file explains the Vercel deployment setup for Hydrogen React Router.

## Build Output Location

React Router with Vite creates a server build. The location depends on your build configuration:
- `.react-router/server-build/` (default)
- `dist/.react-router/server-build/` (if buildDirectory is set to dist)

If the function fails with "Could not load server build", check the Vercel build logs to see where React Router outputs the server build, then update the import paths in `api/index.js`.

## Common Issues

1. **Path Aliases**: The `~/*` aliases in `jsconfig.json` don't work in Vercel runtime. Use relative imports instead.

2. **Virtual Imports**: `virtual:react-router/server-build` only works during build/dev, not in Vercel's runtime. Use actual file paths.

3. **Request Body**: Vercel parses JSON automatically, but we need to handle raw bodies for forms.

4. **Cache API**: Cloudflare's `caches` API doesn't exist in Node.js. We use a mock implementation.

