# transactionPaymentCreate

Create a payment

## Input fields

-   **input** (`TransactionPaymentCreateInput!`)
    Payment create values

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

-   **originatingPaymentTransaction** (`Payment!`)
    The payment transaction that this one originated from

-   **processing** (`Boolean!`)
    Is the transaction still processing

-   **source** (`TransactionSource!`)
    Source of the transaction.

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **transactedFor** (`TransactedForUnion`)
    The quote, invoice, or merch order that this transaction is associated with

-   **transactionDate** (`ISO8601Date!`)
    Transaction date
