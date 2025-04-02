# Payment

Payment

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### disputes (`PaymentDisputeConnection!`)
Disputes of this payment

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### amount (`Float!`)
Amount

### category (`TransactionCategory`)
Payment type (Category)

### description (`String`)
Description of transaction

### id (`ID!`)
The ID

### order (`OrderUnion`)
**Deprecated:** Replaced by field transactedFor

The quote or invoice that this transaction is associated with

### originatingPaymentTransaction (`Payment!`)
The payment transaction that this one originated from

### processing (`Boolean!`)
Is the transaction still processing

### source (`TransactionSource!`)
Source of the transaction.

### timestamps (`ObjectTimestamps!`)
Object timestamps

### transactedFor (`TransactedForUnion`)
The quote, invoice, or merch order that this transaction is associated with

### transactionDate (`ISO8601Date!`)
Transaction date
