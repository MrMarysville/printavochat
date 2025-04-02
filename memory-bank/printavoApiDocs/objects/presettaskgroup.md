# PresetTaskGroup

Preset Task Group

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### presetTasks (`PresetTaskConnection!`)
Preset Tasks

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### id (`ID!`)
The ID

### timestamps (`ObjectTimestamps!`)
Object timestamps

### title (`String!`)
Title of the Preset Task Group
