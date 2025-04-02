# approvalRequestCreate

Create an approval request on a quote or invoice

## Input fields

-   **input** (`ApprovalRequestCreateInput!`)
    Create approval request values

-   **parentId** (`ID!`)
    ID of quote or invoice to add this approval request to

## Return fields

-   **id** (`ID!`)
    The ID

-   **name** (`String!`)
    Approval name

-   **requester** (`User!`)
    User that issued the request

-   **response** (`ApprovalRequestResponse`)
    Response (approve/decline) details

-   **retractor** (`User`)
    User that retracted the request

-   **status** (`ApprovalRequestStatus!`)
    Status of approval request

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps
