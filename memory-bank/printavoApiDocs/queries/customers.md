# customers

Get all customers

## Arguments

- **after** (`String`): Returns the elements in the list that come after the specified cursor.
- **before** (`String`): Returns the elements in the list that come before the specified cursor.
- **first** (`Int`): Returns the first _n_ elements from the list.
- **last** (`Int`): Returns the last _n_ elements from the list.

## Return fields

- **edges** (`[CustomerEdge!]!`): A list of edges.
- **nodes** (`[Customer!]!`): A list of nodes.
- **pageInfo** (`PageInfo!`): Information to aid in pagination.
- **totalNodes** (`Int!`): Total number of nodes.
