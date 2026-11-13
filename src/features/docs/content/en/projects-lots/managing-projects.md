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

**Import CSV** creates or updates projects from a CSV file:

1. Download the template so the headers match the importer.
2. Drop the CSV into the dialog. Headers are matched by name, including Spanish aliases.
3. Review the detected rows and column mapping. The CTA stays disabled while a required column is missing.
4. Choose **Update existing** and **Skip duplicates** as needed.
5. Confirm the import and review the summary (imported, updated, skipped) plus any row errors.

### Columns

| Column | Required | Notes |
| --- | --- | --- |
| `name` | Yes | Project name |
| `code` | No | Used to detect duplicates |
| `address` | Yes | Project address |
| `city` | No | City or zone |
| `price_per_square_unit` | Yes | Non-negative number |
| `lot_count` | No | Integer. Only applied to new projects |
| `measurement_unit` | No | `m2` (default), `ft2`, or `vara2` |
| `project_type` | No | Defaults to `residential` |
| `delivery_date` | No | `YYYY-MM-DD` |
| `description` | No | Free text. Quoted fields and line breaks are supported |
| `interest_rate` | No | Percentage, default `0` |
| `commission_rate_direct` | No | Percentage, default `0` |
| `commission_rate_bank` | No | Percentage, default `0` |
| `commission_rate_cash` | No | Percentage, default `0` |

Spanish aliases such as `nombre`, `codigo`, `direccion`, `ciudad`, `precio_m2`, `lotes`, `unidad`, `tipo`, `fecha_entrega`, `descripcion`, `interes`, `comision_directa`, `comision_banco`, and `comision_contado` are also accepted. The file can be UTF-8 with or without a BOM.

### Example

```csv
name,code,address,city,price_per_square_unit,lot_count,measurement_unit,project_type,delivery_date,description,interest_rate,commission_rate_direct,commission_rate_bank,commission_rate_cash
Proyecto Ejemplo,EJ-001,"Calle 50, Ciudad de Panamá",Ciudad de Panamá,1200,10,m2,residential,2027-06-30,Proyecto de ejemplo,0,0,0,0
```

### Duplicates and options

- **Skip duplicates** omits rows whose `code` or `guid` already exists. It takes precedence over **Update existing**.
- **Update existing** updates the matched project instead of creating it. Required columns always overwrite; optional columns only overwrite when their header is present, and the existing lot count is preserved.
- With both options off, a duplicate code creates another project.

### Results and errors

The dialog shows how many projects were imported, updated, and skipped. Rows that fail validation (missing name or address, invalid number, unsupported unit, invalid date) are listed with their file row number and are not silently ignored; valid rows still import.

## Deleting

Deleting a project is permanent and admin-only. A project with active contracts should not be deleted; cancel or resolve those contracts first.

## Related

- [Projects list and project detail](/docs/projects-list-and-detail)
- [Lots and their statuses](/docs/lots-and-statuses)
- [Reservations, down payments, and holds](/docs/reservations-and-holds)
