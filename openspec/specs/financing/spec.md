# Financing

## Purpose

Show financing progress for a user, including a payment timeline and summary,
and support uploading financing evidence.

## Requirements

### Requirement: Financing summary

The financing summary page SHALL show a hero summary, statistics, a
next-payment card, and a payment timeline for the selected user.

#### Scenario: Open financing summary

- **WHEN** an admin or the matching user opens `/financing/user/:userId`
- **THEN** the financing summary for that user is shown

### Requirement: Financing uploads

The financing upload page SHALL allow the user to submit financing files and
SHALL show success or error feedback.

#### Scenario: Upload a payment file

- **WHEN** the user uploads a file at `/financing/user/:userId/payment/:paymentId/upload`
- **THEN** the upload is submitted through the API
- **AND** the user sees the result
