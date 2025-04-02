# contacts

List of Contacts

## Arguments

-   **after** (`String`)
    Returns the elements in the list that come after the specified cursor.

-   **before** (`String`)
    Returns the elements in the list that come before the specified cursor.

-   **first** (`Int`)
    Returns the first _n_ elements from the list.

-   **last** (`Int`)
    Returns the last _n_ elements from the list.

-   **primaryOnly** (`Boolean`)
    Only search primary contacts?

-   **query** (`String`)
    Query string

-   **sortDescending** (`Boolean`)
    Should the sort be descending?

-   **sortOn** (`ContactSortField`)
    Sort on this field

## Return fields

-   **edges** (`[ContactEdge!]!`)
    A list of edges.

-   **nodes** (`[Contact!]!`)
    A list of nodes.

-   **pageInfo** (`PageInfo!`)
    Information to aid in pagination.

-   **totalNodes** (`Int!`)
    Total number of nodes in the connection.
