# GenericList Component Documentation

## Overview

The `GenericList` component is a highly reusable, feature-rich list component that handles fetching, pagination, and rendering of any entity type (users, projects, contracts, payments, etc.). It provides both mobile card and desktop table views with built-in loading, error, and empty states.

## Location

```
src/shared/ui/GenericList.jsx
```

## Features

- ✅ **Universal Entity Support**: Works with any entity type via the `entityName` prop
- ✅ **Dual View Modes**: Mobile card view and desktop table view
- ✅ **Pagination**: Built-in pagination controls with customizable items per page
- ✅ **Flexible Rendering**: Uses render props pattern for custom item display
- ✅ **State Management**: Handles loading, error, and empty states automatically
- ✅ **Filter Support**: Accepts dynamic filter objects for API queries
- ✅ **Sorting**: Configurable sort parameter
- ✅ **Dark Mode**: Full Tailwind dark mode support
- ✅ **Responsive Design**: Mobile-first with `lg:` breakpoint for desktop
- ✅ **Click Handling**: Built-in item selection with callback

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `endpoint` | `string` | API endpoint path (e.g., `/api/v1/users`) |
| `renderItem` | `function` | Render function: `(item, index, isMobileCard, handleClick) => JSX` |
| `filters` | `object` | Filter object for API query params (e.g., `{ search_term: "", role: "" }`) |
| `onItemSelect` | `function` | Callback when item is clicked: `(item) => void` |
| `columns` | `array` | Array of column definitions for table header: `[{ label: string, align: "left"|"center"|"right" }]` |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortBy` | `string` | `""` | Sort parameter (e.g., `"created_at-desc"`) |
| `itemsPerPage` | `number` | `10` | Number of items per page |
| `emptyMessage` | `string` | `"No items found"` | Message shown when no items |
| `loadingMessage` | `string` | `"Loading..."` | Message shown while loading |
| `showMobileCards` | `boolean` | `true` | Show mobile card view |
| `showDesktopTable` | `boolean` | `true` | Show desktop table view |
| `entityName` | `string` | `"items"` | Entity key in API response |
| `customParams` | `object` | `{}` | Additional custom query params |
| `refreshTrigger` | `any` | `undefined` | Change to trigger refresh |

## Usage Examples

### Basic Usage (Users Page)

```jsx
import GenericList from "../../component/ui/GenericList";
import UserData from "../../component/user/UserData";
import { getToken } from "../../../auth";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { t } = useLocale();
  const token = getToken();

  // Define table columns
  const columns = [
    { label: t('users.user'), align: "left" },
    { label: t('common.status'), align: "center" },
    { label: t('common.actions'), align: "left" }
  ];

  // Define render function
  const renderUserItem = (user, index, isMobileCard, handleClick) => {
    return (
      <UserData
        userInfo={user}
        index={index}
        token={token}
        onClick={() => handleClick(user)}
        isMobileCard={isMobileCard}
      />
    );
  };

  return (
    <GenericList
      endpoint="/api/v1/users"
      renderItem={renderUserItem}
      filters={{ search_term: searchTerm, role: role }}
      onItemSelect={setSelectedUser}
      columns={columns}
      sortBy="created_at-desc"
      itemsPerPage={10}
      emptyMessage={t('users.noUsersFound')}
      loadingMessage={t('users.loadingUsers')}
      entityName="users"
    />
  );
}
```

### Projects Example

```jsx
const renderProjectItem = (project, index, isMobileCard, handleClick) => {
  return (
    <ProjectCard
      project={project}
      index={index}
      onClick={() => handleClick(project)}
      isMobileCard={isMobileCard}
    />
  );
};

<GenericList
  endpoint="/api/v1/projects"
  renderItem={renderProjectItem}
  filters={{ status: statusFilter, search: searchTerm }}
  onItemSelect={setSelectedProject}
  columns={[
    { label: t('projects.name'), align: "left" },
    { label: t('projects.developer'), align: "left" },
    { label: t('common.status'), align: "center" },
    { label: t('common.actions'), align: "right" }
  ]}
  sortBy="created_at-desc"
  itemsPerPage={25}
  emptyMessage={t('projects.noProjectsFound')}
  loadingMessage={t('projects.loadingProjects')}
  entityName="projects"
/>
```

### Contracts Example

```jsx
const renderContractItem = (contract, index, isMobileCard, handleClick) => {
  return (
    <ContractRow
      contract={contract}
      index={index}
      onClick={() => handleClick(contract)}
      isMobileCard={isMobileCard}
    />
  );
};

<GenericList
  endpoint="/api/v1/contracts"
  renderItem={renderContractItem}
  filters={{ 
    search_term: searchTerm, 
    status: statusFilter,
    financing_type: financingTypeFilter 
  }}
  onItemSelect={setSelectedContract}
  columns={[
    { label: t('contracts.contract'), align: "left" },
    { label: t('contracts.customer'), align: "left" },
    { label: t('contracts.amount'), align: "right" },
    { label: t('common.status'), align: "center" },
    { label: t('common.actions'), align: "right" }
  ]}
  sortBy="created_at-desc"
  itemsPerPage={50}
  emptyMessage={t('contracts.noContractsFound')}
  loadingMessage={t('contracts.loadingContracts')}
  entityName="contracts"
/>
```

## Render Function Pattern

The `renderItem` function receives four parameters:

### Parameters

1. **`item`** (object): The current item data (user, project, contract, etc.)
2. **`index`** (number): The item's index in the array (useful for alternating row colors)
3. **`isMobileCard`** (boolean): 
   - `true`: Render as mobile card (full card content in a div)
   - `false`: Render as desktop table row (return only `<td>` elements, no `<tr>`)
4. **`handleClick`** (function): Click handler to trigger `onItemSelect` callback

### Return Values

- **Mobile View** (`isMobileCard === true`): Return full card JSX wrapped in a div
- **Desktop View** (`isMobileCard === false`): Return only `<td>` elements (GenericList wraps them in `<tr>`)

### Example Render Function

```jsx
const renderUserItem = (user, index, isMobileCard, handleClick) => {
  if (isMobileCard) {
    // Mobile Card View - return full card content
    return (
      <div className="bg-white p-6 rounded-lg">
        <h3>{user.full_name}</h3>
        <p>{user.email}</p>
        <button onClick={() => handleClick(user)}>View</button>
      </div>
    );
  }

  // Desktop Table Row - return only td elements
  return (
    <>
      <td className="px-6 py-4">{user.full_name}</td>
      <td className="px-6 py-4">{user.email}</td>
      <td className="px-6 py-4">
        <button onClick={() => handleClick(user)}>View</button>
      </td>
    </>
  );
};
```

## API Response Format

GenericList supports multiple response formats:

### Format 1: Named Entity Array
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "pages": 5
  }
}
```

### Format 2: Generic Items Array
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "pages": 5
  }
}
```

### Format 3: Data Array
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pages": 5
  }
}
```

### Format 4: Flat Array
```json
[...]
```

## Required Translation Keys

Add these keys to your `en.json` and `es.json` locale files:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "noItemsFound": "No items found",
    "tryAdjustingFilters": "Try adjusting your filters",
    "page": "Page",
    "of": "of",
    "previous": "Previous",
    "next": "Next"
  },
  "users": {
    "noUsersFound": "No users found",
    "loadingUsers": "Loading users..."
  }
}
```

## Styling

GenericList uses Tailwind CSS with:
- Dark mode support (`dark:` prefix)
- Responsive breakpoints (`lg:` for desktop views)
- Hover states for interactive elements
- Alternating row colors for tables (controlled by item component via `index` prop)

## Component Structure

```
GenericList
├── Loading State (spinner + message)
├── Error State (red alert box)
├── Empty State (icon + message + helper text)
├── Mobile Cards View (block lg:hidden)
│   └── Item divs with onClick
└── Desktop Table View (hidden lg:block)
    ├── Table Header (columns)
    └── Table Body
        └── Item rows with onClick
└── Pagination Controls
    ├── Previous Button
    ├── Page Indicator (Page X of Y)
    └── Next Button
```

## Item Component Requirements

To work with GenericList, your item component (e.g., `UserData`, `ProjectCard`) must:

1. Accept an `isMobileCard` boolean prop
2. Return different JSX based on `isMobileCard`:
   - Mobile: Full card content (wrapped in div, spans, etc.)
   - Desktop: Only `<td>` elements (GenericList provides the `<tr>`)
3. Accept an `onClick` callback prop for item selection
4. Handle the `index` prop for styling (e.g., alternating row colors)

### Example Item Component Structure

```jsx
function UserData({ userInfo, index, token, onClick, isMobileCard = false }) {
  if (isMobileCard) {
    // Mobile Card View
    return (
      <div className="bg-white p-6 rounded-lg">
        {/* Full card content */}
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <>
      <td className="px-6 py-4">{/* Cell 1 */}</td>
      <td className="px-6 py-4">{/* Cell 2 */}</td>
      <td className="px-6 py-4">{/* Cell 3 */}</td>
    </>
  );
}
```

## Benefits

### Code Reusability
- Single component handles all list views across the app
- Reduces code duplication by ~70%
- Consistent UX patterns across different entity types

### Maintainability
- Centralized pagination logic
- Single source for loading/error/empty states
- Easy to update styling globally

### Flexibility
- Render props pattern allows custom item display
- Works with any entity type via `entityName`
- Supports dynamic filters and sorting

### Performance
- Efficient re-rendering with React hooks
- Pagination reduces DOM size
- Debounced filter updates (when combined with SearchFilterBar)

## Migration Guide

### From Old List Components to GenericList

**Before** (UsersList.jsx):
```jsx
<UsersList
  searchTerm={searchTerm}
  role={role}
  onUserSelect={setSelectedUser}
/>
```

**After** (GenericList):
```jsx
<GenericList
  endpoint="/api/v1/users"
  renderItem={renderUserItem}
  filters={{ search_term: searchTerm, role: role }}
  onItemSelect={setSelectedUser}
  columns={columns}
  sortBy="created_at-desc"
  itemsPerPage={10}
  emptyMessage={t('users.noUsersFound')}
  loadingMessage={t('users.loadingUsers')}
  entityName="users"
/>
```

### Steps:

1. **Create render function**:
   ```jsx
   const renderUserItem = (user, index, isMobileCard, handleClick) => {
     return (
       <UserData
         userInfo={user}
         index={index}
         token={token}
         onClick={() => handleClick(user)}
         isMobileCard={isMobileCard}
       />
     );
   };
   ```

2. **Define columns array**:
   ```jsx
   const columns = [
     { label: t('users.user'), align: "left" },
     { label: t('common.status'), align: "center" },
     { label: t('common.actions'), align: "left" }
   ];
   ```

3. **Update item component** to support `isMobileCard` prop (see Item Component Requirements)

4. **Replace old list component** with GenericList

5. **Add translation keys** for empty/loading messages

6. **Test** both mobile and desktop views

## Related Components

- **SearchFilterBar**: Pairs with GenericList for search/filter functionality
- **Pagination**: GenericList has built-in pagination (no external component needed)
- **Item Components**: UserData, ProjectCard, ContractRow, etc. (must support dual rendering)

## Best Practices

1. **Always provide translation keys** for empty and loading messages
2. **Keep render functions simple** - complex logic should be in item components
3. **Use meaningful column labels** that match your data structure
4. **Set appropriate itemsPerPage** based on your data density (5-50)
5. **Handle onClick events** in item components to prevent event bubbling issues
6. **Test responsive behavior** on both mobile and desktop viewports
7. **Use consistent naming** for entity types (users, projects, contracts, etc.)

## Troubleshooting

### Items not displaying
- Check `entityName` matches your API response key
- Verify API endpoint is correct
- Check browser console for API errors

### Pagination not working
- Ensure API returns `pagination: { page, pages }` metadata
- Verify `itemsPerPage` is set appropriately

### Mobile/Desktop views not switching
- Check Tailwind breakpoint classes (`block lg:hidden`, `hidden lg:block`)
- Verify viewport width is correct
- Ensure item component handles `isMobileCard` prop correctly

### Styling issues
- Verify Tailwind classes are correct
- Check dark mode classes (`dark:` prefix)
- Ensure item component returns correct structure for table rows (only `<td>` elements)

## Future Enhancements

Potential improvements for future versions:

- [ ] Advanced pagination (first/last buttons, page numbers)
- [ ] Items per page selector
- [ ] Bulk selection with checkboxes
- [ ] Export to CSV/Excel
- [ ] Column sorting (click to sort)
- [ ] Column resizing
- [ ] Column visibility toggle
- [ ] Infinite scroll option
- [ ] Virtual scrolling for large datasets

## Contributing

When extending GenericList:

1. Maintain backward compatibility
2. Add PropTypes for new props
3. Update this documentation
4. Test with multiple entity types
5. Ensure dark mode support
6. Keep responsive design consistent

## Version History

- **v1.0.0** (Current): Initial implementation with pagination, dual views, and render props pattern

## License

Same as the parent project.
