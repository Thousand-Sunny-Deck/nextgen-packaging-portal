# Catalog Feature Backend Plan

## Objective

Prepare backend/data flow for the catalog experience so UI can move from current table to grid without reworking core fetch logic.

This plan focuses only on backend and data-contract readiness.

---

## Scope (Backend Only)

1. Image seeding and delivery setup (S3 + CloudFront public-read path strategy)
2. Server action enhancement for manual pagination + filtering
3. Response contract stabilization for current table and future grid UI

Out of scope for this document:

- Final grid UI implementation
- Cart interaction redesign (existing store logic remains)
- Advanced caching infrastructure (Redis) unless needed later

---

## Key Decisions

## 1) Data Fetch Pattern

- Keep Next.js server-action-first approach.
- Do not introduce a separate API route for this feature right now.
- Use URL search params as page state (`q`, `page`, `pageSize`) and pass these values into the server action.

## 2) Product Access Model

- For now, fetch from all products (no entitlement filtering).
- Entitlements can be layered back in later without changing UI contract.

## 3) Image Delivery Model

- Use S3 as source storage.
- Serve product images through CloudFront using public-read asset strategy for catalog images.
- Return a ready-to-render `imageUrl` from backend payload.

## 4) Table Library Strategy

- Keep TanStack.
- Move this view to manual/server mode (`manualPagination`, `manualFiltering`).
- Keep current table UI first to validate backend behavior; grid can be swapped in later.

---

## Target Response Contract

Server action should return:

```ts
type FetchProductsResult = {
	items: Array<{
		sku: string;
		itemCode: string;
		description: string;
		unitCost: number;
		imageUrl: string | null;
	}>;
	page: number; // 1-based
	pageSize: number;
	total: number;
	totalPages: number;
};
```

Search behavior:

- Match on `sku` OR `description`
- Case-insensitive partial match

Pagination behavior:

- Validate/sanitize inputs
- `page >= 1`
- clamp `pageSize` to safe bounds (example: 1..100)
- last page can have fewer items

---

## Backend Implementation Tasks

## Phase A — Image Foundation

1. Define product image key convention (example: `products/<sku>.jpg`).
2. Seed/upload product images to S3 using chosen convention.
3. Ensure each product record can map to an image key.
4. Confirm CloudFront base URL env variable is available.
5. Build/confirm fallback behavior when image is missing (`imageUrl: null`).

## Phase B — Server Action Enhancement

1. Replace array-returning fetch with paginated result contract.
2. Add input params: `search`, `page`, `pageSize`.
3. Add Prisma `where` filter for SKU/description.
4. Use `count + findMany(skip/take)` transaction.
5. Return `items + total + totalPages + page + pageSize`.
6. Map image key to CloudFront `imageUrl` in response.

## Phase C — Table Compatibility (No UI Redesign Yet)

1. Keep existing table view in place.
2. Switch table data wiring to paginated payload (`items` only).
3. Use TanStack manual pagination/filtering mode in this view.
4. Route search/page interactions through URL params.
5. Preserve current footer semantics (`Page X of Y`, row range, next/prev).

---

## Caching Plan (Pragmatic V1)

## Images

- CloudFront caching for image assets (long TTL + versioned keys).

## Product data

- Use Next Data Cache (`unstable_cache`) for server action query results.
- Cache key dimensions: `search + page + pageSize`.
- Add tag-based invalidation (`revalidateTag("products")`) on product changes/imports.

Not required in V1:

- Redis/Upstash cache layer (only add if metrics justify it).

---

## Readiness Checklist (Backend → UI)

- [ ] Product image mapping is available for seeded catalog rows.
- [ ] CloudFront URL mapping works end-to-end.
- [ ] Server action returns paginated contract exactly as defined.
- [ ] Search matches SKU and description.
- [ ] Pagination metadata is accurate for edge pages.
- [ ] Invalid query params are sanitized safely.
- [ ] Missing image fallback path is stable.
- [ ] Basic query performance validated on ~350–500 rows.

When all items are checked, backend is considered UI-ready.

---

## Acceptance Criteria

1. Calling server action with `page=1&pageSize=24` returns first 24 products and correct metadata.
2. Calling server action with search term returns filtered products and updated totals.
3. Last page returns remaining subset correctly (not padded to full page size).
4. Response includes renderable `imageUrl` (or `null`) for each item.
5. Existing table can render from new payload and display `Page X of Y` correctly.
