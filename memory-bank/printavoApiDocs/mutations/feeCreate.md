# feeCreate

Create a fee on a quote or invoice

## Input fields

-   **input** (`FeeInput!`)
    Create fee values

-   **parentId** (`ID!`)
    ID of quote or invoice to add this fee to

## Return fields

-   **amount** (`Float`)
    Effective fee amount

-   **description** (`String`)
    Description

-   **id** (`ID!`)
    The ID

-   **quantity** (`Int`)
    Number of fees

-   **taxable** (`Boolean`)
    Is it taxable?

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **unitPrice** (`Float`)
    Fee amount or percentage amount

-   **unitPriceAsPercentage** (`Boolean`)
    Is amountValue a percentage of order subtotal?
