# approvalRequestApprove

Approve an approval request

## Input fields

-   **id** (`ID!`)
    ID of approval request to approve

-   **respondedBy** (`String!`)
    Who approved the request

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
