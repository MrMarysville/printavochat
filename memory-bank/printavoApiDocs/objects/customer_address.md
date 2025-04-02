# CustomerAddress Object

This document describes the `CustomerAddress` object in the Printavo API v2.0 GraphQL schema, based on information scraped from `https://www.printavo.com/docs/api/v2/object/customeraddress/`.

**Description:** Represents an order address (used for billing and shipping addresses).

## Implements Interfaces

*   [`MailAddress`](https://www.printavo.com/docs/api/v2/interface/mailaddress)
*   [`Timestamps`](https://www.printavo.com/docs/api/v2/interface/timestamps)

## Fields

*   **`address1`** (`String`)
    *   Description: Address line 1.
*   **`address2`** (`String`)
    *   Description: Address line 2.
*   **`city`** (`String`)
    *   Description: City.
*   **`companyName`** (`String`)
    *   Description: Company Name associated with the address.
*   **`country`** (`String`)
    *   Description: Country name.
*   **`countryIso`** (`String`)
    *   Description: Country ISO code (e.g., "US").
*   **`customerName`** (`String`)
    *   Description: Customer Name associated with the address.
*   **`state`** (`String`)
    *   Description: State or region name.
*   **`stateIso`** (`String`)
    *   Description: State or region ISO code (e.g., "WA").
*   **`timestamps`** (`ObjectTimestamps!`)
    *   Description: Object creation and update timestamps.
*   **`zipCode`** (`String`)
    *   Description: Zip or postal code.
