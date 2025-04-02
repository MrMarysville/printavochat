# emailMessageCreate

Create an email message

## Input fields

-   **input** (`EmailMessageInput!`)
    Create email message values

-   **parentId** (`ID!`)
    ID of the quote or invoice this message is related to

## Return fields

-   **bcc** (`String`)
    BCC

-   **cc** (`String`)
    CC

-   **from** (`String!`)
    From

-   **id** (`ID!`)
    The ID

-   **incoming** (`Boolean!`)
    Incoming message?

-   **recipient** (`MessageParticipantUnion`)
    Who was the recipient?

-   **sender** (`MessageParticipantUnion`)
    Who was the sender?

-   **status** (`MessageDeliveryStatus!`)
    Delivery status

-   **subject** (`String!`)
    Subject

-   **text** (`String!`)
    Text

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **to** (`String!`)
    To
