# MKW Item Counter storage

The item counter prefers Upstash Redis when a Redis integration is connected to the Vercel project.

Supported Redis environment variable pairs:
- UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
- KV_REST_API_URL + KV_REST_API_TOKEN

Vercel Blob remains only as a fallback. Because Blob is not suitable for high-frequency polling, the UI and OBS overlay stop retrying when Blob reports that the store is blocked.

After connecting or changing storage, create a new deployment so the deployment receives the current integration environment variables.
