# Contact

Customer contact

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### orders (`OrderUnionConnection!`)
All quotes and invoices assigned to this contact

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### customer (`Customer!`)
This contact's customer

### email (`String`)
Email

### fax (`String`)
Fax

### firstName (`String`)
First name

### fullName (`String`)
Full name

### id (`ID!`)
The ID

### lastName (`String`)
Last name

### orderCount (`Int`)
Order count

### phone (`String`)
Phone

### timestamps (`ObjectTimestamps!`)
Object timestamps
