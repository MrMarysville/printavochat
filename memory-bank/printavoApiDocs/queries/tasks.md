# tasks

Get all tasks

## Arguments

-   **after** (`String`)
    Returns the elements in the list that come after the specified cursor.

-   **assigneeId** (`ID`)
    Find only tasks assigned to this User

-   **before** (`String`)
    Returns the elements in the list that come before the specified cursor.

-   **completed** (`Boolean`)
    Search only for completed tasks?

-   **dueAfter** (`ISO8601DateTime`)
    Find any tasks with a due date after this date

-   **dueBefore** (`ISO8601DateTime`)
    Find any tasks with a due date before this date

-   **excludedOrderStatusIds** (`[ID!]`)
    Only find tasks with associated Orders that do not have one of these statuses

-   **first** (`Int`)
    Returns the first _n_ elements from the list.

-   **includedOrderStatusIds** (`[ID!]`)
    Only find tasks with associated Orders that have one of these statuses

-   **last** (`Int`)
    Returns the last _n_ elements from the list.

-   **sortDescending** (`Boolean`)
    Should the sort be descending?

-   **sortOn** (`TaskSortField`)
    Which field to sort Tasks on

## Return fields

-   **edges** (`[TaskEdge!]!`)
    A list of edges.

-   **nodes** (`[Task!]!`)
    A list of nodes.

-   **pageInfo** (`PageInfo!`)
    Information to aid in pagination.

-   **totalNodes** (`Int!`)
    Total number of nodes in the connection.
