# Kei Projects navigation

The Lounge Card editor and `/item-counter` now render the same menu from `components/KeiProjectsNav.tsx`.

## Optional public environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_KEI_PROJECTS_URL` | Confirmed Firebase Spark landing page, e.g. `https://YOUR_PROJECT_ID.web.app/` |
| `NEXT_PUBLIC_MKW_COURSE_STATS_URL` | Confirmed public MKW Course Stats deployment |

Set these environment variables in the **existing** Lounge Card deployment when the destinations are available. Rebuild/redeploy for changes to public Next.js environment variables to take effect. Do not put secret keys or tokens in `NEXT_PUBLIC_` variables.

When unset, these extra menu entries do not render. Existing BRSTM Hub, Lounge Card, and Item Counter links keep working.

## Compatibility

- The Item Counter backend stays at `/api/item-counter` on its current Vercel origin, with Redis preferred over the Blob fallback.
- OBS URLs and Windows hotkey scripts must continue targeting the current Item Counter origin. Simply adding navigation does not migrate them.
- The Item Counter connection key is scoped to browser localStorage on the **existing origin**. Do not move Item Counter to a new origin without an explicit migration and fallback plan.
- Firebase Spark Hosting cannot run the current Next.js API routes. Some executable downloads such as `.bat` are prohibited on the Spark plan, so continue distributing the hotkey helper via the existing service.
- Do not add billing or paid Firebase services for navigation.
