## Purpose

Provides a single navigation model, design tokens and shared primitives so every
screen uses the same shell and the same accessible controls.

## ADDED Requirements

### Requirement: One navigation model
The system SHALL expose a single navigation configuration for the app. Only one
sidebar SHALL render at any width, and the active item SHALL match route
prefixes so child routes keep their parent item highlighted.

#### Scenario: Child route keeps parent highlighted
- **WHEN** the user is on `/projects/1/lots`
- **THEN** the Proyectos navigation item is highlighted

#### Scenario: No duplicate sidebar
- **WHEN** the layout renders
- **THEN** exactly one sidebar is present in the document

### Requirement: Page identity follows the route
The system SHALL set the page title from the route and `document.title` from
branding, and SHALL set `<html lang>` from the active locale.

#### Scenario: Lots page is not called Dashboard
- **WHEN** the user navigates to a project's lots page
- **THEN** the header shows the lots title, not "Dashboard"

### Requirement: Controls are keyboard accessible
The system SHALL provide a visible focus ring, minimum 44px targets, and native
keyboard behavior for tabs, dialogs, menus, selects and pagination.

#### Scenario: Dialog closes with Escape
- **WHEN** a dialog is open and the user presses Escape
- **THEN** the dialog closes and focus returns to the trigger

#### Scenario: Focus does not leave an open dialog
- **WHEN** the user tabs through an open dialog
- **THEN** focus stays inside the dialog until it is closed

### Requirement: Zoom is never disabled
The system SHALL NOT set `user-scalable=no` and SHALL allow `maximum-scale` ≥ 5.

#### Scenario: Mobile zoom works
- **WHEN** a user pinch-zooms on mobile
- **THEN** the page zooms

### Requirement: Text and contrast meet minimums
The system SHALL use a minimum text size of 11px (uppercase micro-labels only),
and text SHALL meet 4.5:1 contrast (3:1 for text ≥ 24px). `bgray-500` (#A0AEC0)
SHALL NOT be used for text.

#### Scenario: No tiny or low-contrast text
- **WHEN** a list screen renders
- **THEN** no text is below 11px and all text meets the contrast minimum

### Requirement: Shared primitives expose states
The system SHALL provide `EmptyState`, `ErrorState` and `Skeleton` primitives,
and list screens SHALL render one of them instead of a blank page or a raw API
message.

#### Scenario: Empty list shows a reason and an action
- **WHEN** a list has no records
- **THEN** an empty state with a reason and a next action is shown

#### Scenario: Error offers retry
- **WHEN** a list request fails
- **THEN** an error state with a retry action is shown
