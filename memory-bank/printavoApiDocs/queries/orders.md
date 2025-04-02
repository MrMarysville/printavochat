# orders

Get all quotes and invoices

## Arguments

- **after** (`String`): Returns the elements in the list that come after the specified cursor.
- **before** (`String`): Returns the elements in the list that come before the specified cursor.
- **excludeStatusIds** (`[ID!]`): Exclude ones with these status IDs.
- **first** (`Int`): Returns the first _n_ elements from the list.
- **inProductionAfter** (`ISO8601DateTime`): Find any with a due_date after this date.
- **inProductionBefore** (`ISO8601DateTime`): Find any with a start_date before this date.
- **last** (`Int`): Returns the last _n_ elements from the list.
- **paymentStatus** (`OrderPaymentStatus`): Find any with this payment status.
- **query** (`String`): Query string.
- **sortDescending** (`Boolean`): Should the sort be descending?
- **sortOn** (`OrderSortField`): Sort on this field.
- **statusIds** (`[ID!]`): Only include ones with these status IDs.
- **tags** (`[String!]`): Find any with one of these tags. Ignored if using a query.

## Return fields

- **edges** (`[OrderUnionEdge!]!`): A list of edges.
- **nodes** (`[OrderUnion!]!`): A list of nodes.
- **pageInfo** (`PageInfo!`): Information to aid in pagination.
