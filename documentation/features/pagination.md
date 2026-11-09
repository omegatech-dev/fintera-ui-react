# Pagination

FinteraUI uses two pagination approaches.

## PaginationV2

`src/shared/ui/PaginationV2.jsx` is a controlled pagination control used by
pages that manage their own list state.

Props:

| Prop | Type | Description |
| --- | --- | --- |
| `currentPage` | number | Active page (1-based) |
| `totalPages` | number | Total number of pages |
| `onPrev` | function | Called with `currentPage - 1` |
| `onNext` | function | Called with `currentPage + 1` |
| `onPageClick` | function | Called with the selected page |
| `className` | string | Optional wrapper classes |

It renders first/last pages, the current page with neighbors, and ellipses for
large page counts. Previous/next buttons are disabled at the bounds.

Example usage (`src/features/audits/pages/index.jsx`):

```jsx
<PaginationV2
  currentPage={page}
  totalPages={totalPages}
  onPageClick={handlePageChange}
  onPrev={handlePageChange}
  onNext={handlePageChange}
/>
```

## GenericList pagination

`src/shared/ui/GenericList.jsx` includes built-in server-side pagination:

- Sends `page` and `per_page` to the configured `endpoint`.
- Reads page counts from the response (`pagination.pages`,
  `pagination.total_pages`, or a `total` value).
- Supports sorting, filters, search, and an items-per-page control.
- `itemsPerPage` defaults to 5.

Use `GenericList` when you need a full list (table on desktop, cards on mobile)
with minimal page-level code. Use `PaginationV2` when a page manages its own
data fetching and only needs the control.

## Conventions

- Keep pagination state in the page or `GenericList`, not in shared contexts.
- Reset to page 1 when filters, search, or page size change.
- Build query strings with `URLSearchParams`; `apiClient` does not serialize a
  `params` option.
