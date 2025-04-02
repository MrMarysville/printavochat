# Invoice

Invoice

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)
- [`VisualIDed`](../interface/visualided.md)

## Connections

### approvalRequests (`ApprovalRequestConnection!`)
Approval requests

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### customAddresses (`CustomAddressConnection`)
Custom addresses

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### expenses (`ExpenseConnection`)
Expenses

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### fees (`FeeConnection!`)
Fees

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### lineItemGroups (`LineItemGroupConnection!`)
Line item groups

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### productionFiles (`ProductionFileConnection!`)
Production files

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### tasks (`TaskConnection!`)
Tasks

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### transactions (`TransactionUnionConnection`)
Transactions

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### amountOutstanding (`Float`)
Amount outstanding

### amountPaid (`Float`)
Amount paid

### billingAddress (`CustomerAddress`)
Billing address

### contact (`Contact!`)
Customer contact

### contractorProfile (`ContractorProfile`)
Contractor profile

### createdAt (`ISO8601Date!`)
Created date

### customerDueAt (`ISO8601Date!`)
Customer due date

### customerNote (`String`)
Customer note

### deliveryMethod (`DeliveryMethod`)
Delivery method

### discount (`Float`)
Discount

### discountAmount (`Float`)
Discount Amount

### discountAsPercentage (`Boolean`)
Discount is percentage?

### dueAt (`ISO8601DateTime`)
Production due date

### id (`ID!`)
The ID

### invoiceAt (`ISO8601Date!`)
Invoice date

### merch (`Boolean!`)
Is this from a merch order?

### nickname (`String`)
Nickname

### owner (`User`)
User who owns the order

### packingSlipUrl (`String!`)
Packing slip url

### paidInFull (`Boolean!`)
Paid in full?

### paymentDueAt (`ISO8601Date!`)
Payment due date

### paymentRequest (`PaymentRequest`)
Payment request

### paymentTerm (`PaymentTerm`)
Payment term

### productionNote (`String`)
Production notes

### publicHash (`String!`)
Public hash

### publicPdf (`String!`)
Public pdf url

### publicUrl (`String!`)
Public url

### salesTax (`Float`)
Sales tax

### salesTaxAmount (`Float`)
Sales Tax Amount

### shippingAddress (`CustomerAddress`)
Shipping address

### startAt (`ISO8601DateTime!`)
Start date

### status (`Status!`)
Status

### subtotal (`Float`)
Subtotal

### tags (`[String!]!`)
Tasks

### threadSummary (`ThreadSummary`)
Messages

### timestamps (`ObjectTimestamps!`)
Object timestamps

### total (`Float`)
Total

### totalQuantity (`Int`)
Total quantity of items

### totalUntaxed (`Float`)
Total untaxed

### url (`String!`)
Url

### visualId (`ID`)
Invoice #

### visualPoNumber (`String`)
PO Number

### workorderUrl (`String!`)
Workorder url
