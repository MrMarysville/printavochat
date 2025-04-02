# Customer

Customer

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### contacts (`ContactConnection!`)
Contacts

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### orders (`OrderUnionConnection!`)
All quotes and invoices assigned to this customer

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### reminders (`TaskConnection!`)
Reminders

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### billingAddress (`Address`)
Billing address

### companyName (`String`)
Company name

### defaultPaymentTerm (`PaymentTerm`)
Default payment term

### id (`ID!`)
The ID

### internalNote (`String`)
Internal note

### orderCount (`Int!`)
This customer's order count

### owner (`User`)
User who owns the customer

### primaryContact (`Contact!`)
The primary contact for this customer

### publicUrl (`String!`)
Public url for customer

### resaleNumber (`String`)
Resale number

### salesTax (`Float`)
Sales tax

### shippingAddress (`Address`)
Shipping address

### taxExempt (`Boolean!`)
Is the customer tax exempt?

### timestamps (`ObjectTimestamps!`)
Object timestamps
