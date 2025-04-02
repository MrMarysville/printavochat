# thread

Get all the messages in a thread

## Arguments

-   **id** (`ID!`)
    Thread ID to get messages from

## Return fields

-   **id** (`ID!`)
    Thread ID

-   **regarding** (`OrderUnion`)
    Quote or Invoice the message is regarding

-   **unread** (`Boolean!`)
    Is the thread unread?
