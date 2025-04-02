# products

List of products

## Arguments

-   **after** (`String`)
    Returns the elements in the list that come after the specified cursor.

-   **before** (`String`)
    Returns the elements in the list that come before the specified cursor.

-   **first** (`Int`)
    Returns the first _n_ elements from the list.

-   **last** (`Int`)
    Returns the last _n_ elements from the list.

-   **query** (`String!`)
    Product search term

## Return fields

-   **edges** (`[ProductEdge!]!`)
    A list of edges.

-   **nodes** (`[Product!]!`)
    A list of nodes.

-   **pageInfo** (`PageInfo!`)
    Information to aid in pagination.

-   **totalNodes** (`Int!`)
    Total number of nodes in the connection.
