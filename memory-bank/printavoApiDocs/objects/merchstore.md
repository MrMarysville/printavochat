# MerchStore

Merch store

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### orders (`MerchOrderConnection!`)
List of merch orders on the store

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `completedAfter` | `ISO8601DateTime` | Only list orders that have been completed after this datetime |
| `completedBefore` | `ISO8601DateTime` | Only list orders that have been completed before this datetime |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |
| `status` | `MerchOrderStatus` | Only list orders that have this status |

## Fields

### closesAt (`ISO8601DateTime`)
Date the order was completed

### id (`ID!`)
The ID

### name (`String!`)
Name of the store

### status (`MerchStoreStatus!`)
Store status

### summary (`MerchStoreSummary!`)
Store summary

### timestamps (`ObjectTimestamps!`)
Object timestamps
