# SearchFilterBar Component

## Overview
A reusable, flexible search and filter bar component that can be used across different pages in the application.

## Location
`src/shared/ui/SearchFilterBar.jsx`

## Features
- ✅ **Debounced Search**: Prevents excessive API calls with 500ms delay
- ✅ **Dropdown Filter**: Customizable filter options with labels and values
- ✅ **Action Buttons**: Support for multiple action buttons (e.g., "Add User", "Export", etc.)
- ✅ **Role-based Filtering**: Dynamic filter options based on user permissions
- ✅ **Dark Mode Support**: Full dark mode styling
- ✅ **Responsive Design**: Mobile and desktop optimized
- ✅ **Accessible**: Proper ARIA labels and keyboard navigation

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `searchTerm` | string | `""` | No | Initial search term value |
| `filterValue` | string | `""` | No | Currently selected filter value |
| `filterOptions` | Array<{value, label}> | `[]` | No | Filter dropdown options |
| `onSearchChange` | Function | `() => {}` | Yes | Callback when search changes (debounced) |
| `onFilterChange` | Function | `() => {}` | Yes | Callback when filter selection changes |
| `searchPlaceholder` | string | `"Search..."` | No | Placeholder text for search input |
| `filterPlaceholder` | string | `"Select Filter"` | No | Placeholder text for filter dropdown |
| `minSearchLength` | number | `3` | No | Minimum characters to trigger search |
| `showFilter` | boolean | `true` | No | Whether to show the filter dropdown |
| `actions` | Array<{label, onClick, className, icon}> | `[]` | No | Action buttons to display |

## Usage Examples

### Basic Usage (Search Only)
```jsx
import SearchFilterBar from "../../component/ui/SearchFilterBar";

function MyPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search users..."
      showFilter={false}
    />
  );
}
```

### With Filter Dropdown
```jsx
import SearchFilterBar from "../../component/ui/SearchFilterBar";

function MyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      filterValue={status}
      filterOptions={statusOptions}
      onSearchChange={setSearchTerm}
      onFilterChange={setStatus}
      searchPlaceholder="Search..."
      filterPlaceholder="Select Status"
    />
  );
}
```

### With Action Buttons
```jsx
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import { useNavigate } from "react-router-dom";

function MyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search..."
      showFilter={false}
      actions={[
        {
          label: "Add User",
          onClick: () => navigate("/users/create"),
          className: "py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
        },
        {
          label: "Export",
          onClick: () => handleExport(),
          className: "py-3 px-10 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
        }
      ]}
    />
  );
}
```

### Complete Example (Users Page Pattern)
```jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";

function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Get available role options based on current user's role
  const getRoleFilterOptions = () => {
    const allRoles = [
      { value: "", label: t('userFilter.all') },
      { value: "User", label: t('userFilter.user') },
      { value: "Seller", label: t('userFilter.seller') },
      { value: "Admin", label: t('userFilter.admin') }
    ];
    
    if (user?.role === 'admin') {
      return allRoles;
    } else if (user?.role === 'seller') {
      return [allRoles[0], allRoles[1]];
    }
    
    return [allRoles[0]];
  };

  return (
    <div>
      <SearchFilterBar
        searchTerm={searchTerm}
        filterValue={role}
        filterOptions={getRoleFilterOptions()}
        onSearchChange={setSearchTerm}
        onFilterChange={setRole}
        searchPlaceholder={t('userFilter.searchPlaceholder')}
        filterPlaceholder={t('userFilter.selectType')}
        minSearchLength={3}
        showFilter={true}
        actions={[
          {
            label: t('userFilter.addUser'),
            onClick: () => navigate("/users/create"),
            className: "py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all"
          }
        ]}
      />
      {/* Rest of your page content */}
    </div>
  );
}
```

## Filter Options Format

Filter options must be an array of objects with `value` and `label` properties:

```javascript
const filterOptions = [
  { value: "", label: "All" },           // Empty value for "All" option
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" }
];
```

## Action Buttons Format

Action buttons must be an array of objects with these properties:

```javascript
const actions = [
  {
    label: "Button Text",        // Required: Button text
    onClick: () => {},            // Required: Click handler function
    className: "custom-class",    // Optional: Custom CSS classes
    icon: <SomeIcon />            // Optional: Icon component
  }
];
```

## Styling

The component uses Tailwind CSS classes and supports:
- Light and dark modes
- Responsive design (mobile/tablet/desktop)
- Custom button styling via `className` prop in actions

### Default Button Style
```css
py-3 px-10 bg-success-300 text-white font-bold rounded-lg hover:bg-success-400 transition-all
```

## Search Behavior

- **Minimum Length**: By default, search triggers only when the user types 3 or more characters
- **Debouncing**: 500ms delay after the user stops typing before `onSearchChange` is called
- **Reset**: If the user clears the search (< minimum length), `onSearchChange("")` is called
- **Cleanup**: Debounced function is properly cleaned up on component unmount

## Accessibility

- All buttons have `aria-label` attributes
- Keyboard navigation supported for dropdowns
- Proper focus states on interactive elements
- Screen reader friendly

## Migration from UserFilter

If you're migrating from the old `UserFilter` component:

### Before
```jsx
<UserFilter
  searchTerm={searchTerm}
  role={role}
  onSearchChange={setSearchTerm}
  onRoleChange={setRole}
/>
```

### After
```jsx
<SearchFilterBar
  searchTerm={searchTerm}
  filterValue={role}
  filterOptions={roleOptions}
  onSearchChange={setSearchTerm}
  onFilterChange={setRole}
  searchPlaceholder={t('userFilter.searchPlaceholder')}
  filterPlaceholder={t('userFilter.selectType')}
  actions={[
    {
      label: t('userFilter.addUser'),
      onClick: () => navigate("/users/create")
    }
  ]}
/>
```

## Benefits Over Old UserFilter

1. ✅ **Reusable**: Can be used across different pages (users, projects, contracts, etc.)
2. ✅ **Flexible**: Supports any number of action buttons
3. ✅ **Configurable**: All labels, placeholders, and options are customizable
4. ✅ **Cleaner**: Separates concerns - business logic stays in parent component
5. ✅ **Type-safe**: Uses PropTypes for type checking
6. ✅ **Maintainable**: Single source of truth for search/filter patterns

## Where to Use

This component is ideal for:
- User management pages
- Project listing pages
- Contract listing pages
- Payment history pages (with custom filters)
- Any page with search + filter + actions pattern

## Dependencies

- React (useState, useEffect, useCallback)
- PropTypes
- lodash.debounce

## Related Components

- `GenericFilter` - Simpler filter component without action buttons
- `UserFilter` - Old user-specific filter (can be deprecated)
- `TransactionFilter` - Transaction-specific filter

## Future Enhancements

Potential improvements:
- [ ] Support for multiple filter dropdowns
- [ ] Advanced filter modal/drawer
- [ ] Export to CSV/Excel built-in
- [ ] Saved filter presets
- [ ] Filter chips/tags display
- [ ] Clear all filters button
