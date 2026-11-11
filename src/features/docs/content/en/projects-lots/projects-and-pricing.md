# Projects, pricing, and measurement units

A **project** is a development that contains many **lots**. Each project stores the defaults that flow into its lots.

## Project fields

- **Project type** — residential, commercial, industrial, or mixed use.
- **Measurement unit** — `m²` (square meters), `ft²` (square feet), or `varas²` (square varas).
- **Price per square unit** — the base price of one unit of area in the project.
- **Interest rate** — the annual rate used for direct financing and for overdue interest. A rate of `0` means no interest is charged.
- **Commission rates** — separate percentages for **direct**, **bank**, and **cash** financing.
- **Delivery date**, **city**, and **code** — descriptive fields.

## How a lot's price is built

A lot's price is based on its **area** and the project's **price per square unit**. The area is `length × width`, unless an **override area** is set. A lot can also have an **override price**, which replaces the calculated price.

> Changing a project's measurement unit converts the measurements and unit prices of all its lots. This is why the system asks for confirmation.

## Publishing

A project can be **published** (visible in the customer portal) or unpublished. Publishing is an admin action; sellers see the current state but do not change it.

## Related

- [Lots and their statuses](/docs/lots-and-statuses)
- [Financing types](/docs/financing-types)
