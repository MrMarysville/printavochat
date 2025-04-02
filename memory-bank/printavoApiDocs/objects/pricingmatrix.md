# PricingMatrix

Pricing matrix

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### cells (`PricingMatrixCellConnection!`)
Pricing matrix cells

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### columns (`[PricingMatrixColumn!]!`)
Pricing matrix columns

### id (`ID!`)
The ID

### name (`String!`)
Name

### timestamps (`ObjectTimestamps!`)
Object timestamps

### typeOfWork (`TypeOfWork`)
Type of work
