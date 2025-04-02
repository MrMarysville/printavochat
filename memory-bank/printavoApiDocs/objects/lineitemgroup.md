# LineItemGroup

Line item group

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### imprints (`ImprintConnection!`)
The imprints

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

### lineItems (`LineItemConnection!`)
Line items

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### enabledColumns (`LineItemEnabledColumns!`)
Columns enabled for the group

### id (`ID!`)
The ID

### order (`OrderUnion!`)
Quote or Invoice this line item group belongs to

### position (`Int!`)
Order position

### timestamps (`ObjectTimestamps!`)
Object timestamps
