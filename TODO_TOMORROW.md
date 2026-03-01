# Tomorrow's Checklist

- [ ] 1. Merge current changes (feature gate + fetchCatalog + page wiring)
- [ ] 2. Update `ProductTable` to include the new manual pagination + server-side search query mode (flag-gated — non-flagged orgs keep existing client-side table)
- [ ] 3. Seed product images to S3 using key convention `products/<sku>.jpg`
- [ ] 4. Update `featureFlags` / `CATALOG_V2_ENABLED` to support dynamic org-level flagging (only return `true` for given `orgId`s)
- [ ] 5. Test the flagged flow end-to-end for flagged orgIds
- [ ] 6. Covered by (2) — ensure non-flagged orgIds continue to render the old client-side `ProductTable` unchanged
