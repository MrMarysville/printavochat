# EmailMessage

Email Message

## Implements

- [`IDed`](../interface/ided.md)
- [`Message`](../interface/message.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### attachments (`MessageAttachmentConnection!`)
Attached files

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

### bcc (`String`)
BCC

### cc (`String`)
CC

### from (`String!`)
From

### id (`ID!`)
The ID

### incoming (`Boolean!`)
Incoming message?

### recipient (`MessageParticipantUnion`)
Who was the recipient?

### sender (`MessageParticipantUnion`)
Who was the sender?

### status (`MessageDeliveryStatus!`)
Delivery status

### subject (`String!`)
Subject

### text (`String!`)
Text

### timestamps (`ObjectTimestamps!`)
Object timestamps

### to (`String!`)
To
