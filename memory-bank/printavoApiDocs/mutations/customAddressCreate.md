# customAddressCreate

Create a custom address on a quote or invoice

## Input fields

-   **input** (`CustomAddressInput!`)
    Create address values

-   **parentId** (`ID!`)
    ID of quote or invoice to add this address to

## Return fields

-   **address1** (`String`)
    Address line 1

-   **address2** (`String`)
    Address line 2

-   **city** (`String`)
    City

-   **companyName** (`String`)
    Company Name

-   **country** (`String`)
    Country

-   **countryIso** (`String`)
    Country ISO

-   **customerName** (`String`)
    Customer Name

-   **id** (`ID!`)
    The ID

-   **name** (`String`)
    Address Name

-   **state** (`String`)
    State

-   **stateIso** (`String`)
    State ISO

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **zipCode** (`String`)
    Zip code
