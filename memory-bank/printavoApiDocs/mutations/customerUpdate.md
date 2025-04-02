# customerUpdate

Update a customer

## Input fields

-   **id** (`ID!`)
    ID of customer to update

-   **input** (`CustomerInput!`)
    Update customer values

## Return fields

-   **billingAddress** (`Address`)
    Billing address

-   **companyName** (`String`)
    Company name

-   **defaultPaymentTerm** (`PaymentTerm`)
    Default payment term

-   **id** (`ID!`)
    The ID

-   **internalNote** (`String`)
    Internal note

-   **orderCount** (`Int!`)
    This customer's order count

-   **owner** (`User`)
    User who owns the customer

-   **primaryContact** (`Contact!`)
    The primary contact for this customer

-   **publicUrl** (`String!`)
    Public url for customer

-   **resaleNumber** (`String`)
    Resale number

-   **salesTax** (`Float`)
    Sales tax

-   **shippingAddress** (`Address`)
    Shipping address

-   **taxExempt** (`Boolean!`)
    Is the customer tax exempt?

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps
