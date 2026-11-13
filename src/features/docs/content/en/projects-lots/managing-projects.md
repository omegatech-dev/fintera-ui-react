# Creating and managing projects and lots

> **Admin only.** Sellers can view projects and lots and create reservations, but cannot create, edit, delete, or publish projects.

## Create a project

1. Open **Projects** and select **New Project**.
2. Section **Information**: name, code, and optional public ID.
3. Section **Pricing and commissions**: price per square unit, currency, number of lots, interest rate, and the commission rates for direct, bank, and cash financing.
4. Section **Location**: address, city or zone, project type, delivery date, and measurement unit.
5. Section **Description**: the text shown in the project detail and customer portal.

The save bar stays disabled until the required fields are valid. New projects start as **drafts**; publish them from the project detail or edit page.

## Edit a project

- The **Publishing** panel controls whether the project is visible in the customer portal. Unpublishing hides it without deleting data.
- Changing the **measurement unit** asks for confirmation because it converts the measurements and unit price of every lot.
- The **number of lots** cannot be changed when the project already has reserved or sold lots.
- Plans and photos are managed from the **Media** tab of the project detail.

## Manage lots

- Open a project and select **View lots**, then **New Lot**.
- A lot stores its name, optional address and registration number, dimensions, measurement unit, optional override area, optional override price, boundary descriptions, and notes.
- The **calculated area** is `length × width`; the **estimated price** is the area multiplied by the project price per unit.
- Use **override area** or **override price** only when the calculated value is not what you want.
- From the lot list, admins can edit lots; everyone with access can open a lot and start a reservation when it is available.

## Import CSV

**Import CSV** creates or updates projects from a file:

1. Download the template or use your own headers.
2. Drop the CSV into the dialog. The system maps recognizable headers, including Spanish aliases.
3. Review the detected rows and column mapping.
4. Choose **Update existing** and **Skip duplicates** as needed.
5. Confirm the import.

The template columns are `name`, `code`, `address`, `city`, `price_per_square_unit`, `lot_count`, `measurement_unit`, `project_type`, `delivery_date`, and `description`.

## Deleting

Deleting a project is permanent and admin-only. A project with active contracts should not be deleted; cancel or resolve those contracts first.

## Related

- [Projects list and project detail](/docs/projects-list-and-detail)
- [Lots and their statuses](/docs/lots-and-statuses)
- [Reservations, down payments, and holds](/docs/reservations-and-holds)
