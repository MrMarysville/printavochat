# transactionPaymentUpdate

Update a payment

## Input fields

-   **id** (`ID!`)
    ID of payment to update

-   **input** (`TransactionInput!`)
    Update payment values

## Return fields

-   **amount** (`Float!`)
    Amount

-   **category** (`TransactionCategory`)
    Payment type (Category)

-   **description** (`String`)
    Description of transaction

-   **id** (`ID!`)
    The ID

-   **order** (`OrderUnion`)
    **Deprecation notice**: Replaced by field transactedFor
    The quote or invoice that this transaction is associated with

-   **originatingpaymenttransaction** (`Payment!`)
    The payment transaction that this one originated from

-   **processing** (`Boolean!`)
    Is the transaction still processing

-   **source** (`TransactionSource!`)
    Source of the transaction.

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **transactedfor** (`TransactedForUnion`)
    The quote, invoice, or merch order that this transaction is associated with

-   **transactionDate** (`ISO8601Date!`)
    Transaction date
