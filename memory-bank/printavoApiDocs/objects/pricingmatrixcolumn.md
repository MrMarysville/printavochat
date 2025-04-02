# PricingMatrixColumn

Pricing matrix column

## Implements

- [`IDed`](../interface/ided.md)

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

### columnId (`ID!`)
Column ID

### columnName (`String!`)
Name

### id (`ID!`)
The ID

### matrix (`PricingMatrix!`)
Pricing Matrix
