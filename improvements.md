Bonus Tier 1: Product Polish

1) Search or filtering

Goal: help users find items fast without extra clicks.

Implementation
	•	UI: add a search input above the list and optional filter chips (status, priority).
	•	State: keep search, status, priority in URL query params so it is shareable and survives refresh.
	•	API:
	•	Add optional query params: q, status, priority
	•	Apply ILIKE on title or description for q
	•	Combine with pagination and user scoping

Acceptance
	•	Typing search updates results (debounced 300 ms).
	•	Filters persist on refresh and page reload.

2) Sorting

Goal: let user control ordering.

Implementation
	•	UI: sort dropdown (Newest, Oldest, Title A to Z, Priority).
	•	API: query params sortBy and sortDir
	•	Backend: allowlist valid columns only, never interpolate raw input into SQL.

Acceptance
	•	Sort changes ordering without breaking pagination.

3) Optimistic updates

Goal: app feels instant for create, update, delete.

Implementation with React Query
	•	Create, update, delete mutations:
	•	onMutate: snapshot current list, apply optimistic change to cache
	•	onError: rollback snapshot
	•	onSettled: invalidate list queries
	•	For create: temporarily add item with tempId and replace when server returns real id.

Acceptance
	•	UI updates immediately on actions.
	•	If request fails, UI rolls back and shows toast.

4) Improved accessibility

Goal: keyboard and screen reader friendly.

Implementation
	•	Use semantic elements: buttons, labels, form errors.
	•	Focus management:
	•	After creating item, focus the first field or the new row.
	•	After delete confirmation, return focus to a sensible element.
	•	Announce async state:
	•	aria-busy on list container during loading
	•	role="status" for “Saved”, “Deleted”
	•	Ensure color contrast and visible focus rings.

Acceptance
	•	Full CRUD works with keyboard only.
	•	Errors are announced and tied to inputs.

⸻

Bonus Tier 2: Engineering Depth

1) Request logging

Goal: visibility into requests, errors, latency.

Implementation (Fastify)
	•	Use built in logger: true and configure Pino options.
	•	Add request id:
	•	Generate if missing, echo in response header x-request-id.
	•	Log structured fields:
	•	method, url, statusCode, responseTime, userId (if available), error stack for 5xx.

Acceptance
	•	Every request logs one line with request id and latency.
	•	Errors include enough context to debug.

2) Rate limiting

Goal: basic abuse protection for auth and API endpoints.

Implementation
	•	Add @fastify/rate-limit
	•	Strategy:
	•	Strict limits for auth endpoints (sign in, sign up)
	•	Moderate limits for items endpoints
	•	If behind a proxy, enable trustProxy so client IP is correct.

Acceptance
	•	Exceeding limits returns 429 with a clear message.
	•	Limits do not block normal usage.

3) Health endpoint

Goal: deploy and monitoring readiness.

Implementation
	•	Add GET /health:
	•	returns { ok: true, uptime, version }
	•	Optional deeper check:
	•	lightweight DB ping (select 1) with timeout
	•	Use:
	•	/health for liveness
	•	/ready for readiness if you want separation

Acceptance
	•	Returns 200 when app is healthy.
	•	Fails when DB is unreachable (if you implement readiness).