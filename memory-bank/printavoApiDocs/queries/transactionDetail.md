# transactionDetail

Get transaction details by ID

## Arguments

-   **id** (`ID!`)
    The ID of the transaction to retrieve details for

## Return fields

-   **amount** (`Float!`)
    Amount

-   **billingAddress** (`BillingAddress!`)
    Billing address

-   **category** (`TransactionCategory`)
    Payment type (Category)

-   **ccCardType** (`String`)
    Type of credit card

-   **ccLastFour** (`String`)
    Last 4 of credit card

-   **description** (`String`)
    Description of transaction

-   **id** (`ID!`)
    The ID

-   **order** (`OrderUnion`)
    **Deprecation notice**: Replaced by field transactedFor
    The quote or invoice that this transaction is associated with

-   **originatingPaymentTransaction** (`Payment!`)
    The payment transaction that this one originated from

-   **portalTransactionId** (`String`)
    Portal Transaction ID

-   **processing** (`Boolean!`)
    Is the transaction still processing

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **transactedFor** (`TransactedForUnion`)
    The quote, invoice, or merch order that this transaction is associated with

-   **transactionDate** (`ISO8601Date!`)
    Transaction date
