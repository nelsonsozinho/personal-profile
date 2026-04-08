# AGENTS Guide

## Project snapshot
- Angular 21 app using **standalone APIs** (no NgModules): bootstrap starts at `src/main.ts` with `bootstrapApplication(App, appConfig)`.
- SSR is enabled and wired through Express + Angular SSR node engine in `src/server.ts`.
- Current UI is still Angular starter placeholder markup in `src/app/app.html`; treat it as scaffold, not stable product structure.

## Architecture and data flow
- Client bootstrap: `src/main.ts` -> `src/app/app.config.ts` -> `src/app/app.ts`.
- Server bootstrap: `src/main.server.ts` -> `src/app/app.config.server.ts` (merges client config + server rendering providers).
- Request flow on server: static assets from `dist/.../browser`, then fallback render via `AngularNodeAppEngine.handle(req)` in `src/server.ts`.
- SSR route policy is catch-all prerender: `src/app/app.routes.server.ts` sets `path: '**'` with `RenderMode.Prerender`.
- Router exists but has no app routes yet: `src/app/app.routes.ts` exports `routes: Routes = []`.

## Commands agents should use
- Install deps: `npm install`
- Dev server: `npm start` (alias for `ng serve`, default Angular dev config)
- Build (SSR-capable output): `npm run build`
- Watch build: `npm run watch`
- Unit tests (Vitest via Angular builder): `npm test`
- Run built SSR server: `npm run serve:ssr:personal-profile` (after build)

## Code conventions in this repo
- Use SASS for component/global styles (`angular.json` sets `inlineStyleLanguage: 'sass'`; component schematic defaults to SASS).
- Formatting: 2 spaces, UTF-8, trim trailing whitespace (`.editorconfig`).
- TypeScript style prefers single quotes (`.editorconfig` + `.prettierrc`).
- HTML formatting is handled by Prettier Angular parser (`.prettierrc` override for `*.html`).
- Keep strict typing intact: `tsconfig.json` enables strict TS + strict Angular template checks.

## Integration points and guardrails
- Add backend endpoints in `src/server.ts` before the SSR catch-all middleware (the file already marks this extension point).
- If adding browser-only APIs (`window`, `document`, storage), keep SSR safety in mind because server rendering is on by default.
- When introducing routes, update both client routes (`src/app/app.routes.ts`) and server-route behavior (`src/app/app.routes.server.ts`) if render mode should differ.
- Keep `RouterOutlet` available in `src/app/app.ts`/`src/app/app.html` when adding routed pages.

## Quick checklist for agent changes
- Run `npm test` after TypeScript/template changes.
- Run `npm run build` when touching SSR, routing, or server files.
- Prefer minimal edits to starter placeholder blocks in `src/app/app.html` unless intentionally replacing the scaffold.

