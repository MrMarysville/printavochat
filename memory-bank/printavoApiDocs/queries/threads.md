# threads

Get latest message from all threads

## Arguments

-   **after** (`String`)
    Returns the elements in the list that come after the specified cursor.

-   **before** (`String`)
    Returns the elements in the list that come before the specified cursor.

-   **first** (`Int`)
    Returns the first _n_ elements from the list.

-   **last** (`Int`)
    Returns the last _n_ elements from the list.

-   **onlyWithUnread** (`Boolean`)
    Only return threads that have unread messages?

## Return fields

-   **edges** (`[ThreadSummaryEdge!]!`)
    A list of edges.

-   **nodes** (`[ThreadSummary!]!`)
    A list of nodes.

-   **pageInfo** (`PageInfo!`)
    Information to aid in pagination.

-   **totalNodes** (`Int!`)
    Total number of nodes in the connection.
