# PaymentRequest

Payment request

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### requestedFor (`OrderUnionConnection!`)
Orders attached to the payment request

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### amount (`Float!`)
Amount requested

### description (`String`)
Payment request description

### id (`ID!`)
The ID

### timestamps (`ObjectTimestamps!`)
Object timestamps

### user (`User`)
User issuing the payment request
