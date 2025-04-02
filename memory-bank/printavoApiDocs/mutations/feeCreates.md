# feeCreates

Create multiple fees on a quote or invoice

## Input fields

-   **inputs** (`[FeeCreatesInput!]!`)
    Values to create fees with

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
