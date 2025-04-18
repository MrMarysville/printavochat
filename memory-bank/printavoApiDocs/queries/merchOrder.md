# merchOrder

Get merch order by ID

## Arguments

-   **id** (`ID!`)
    The ID of the merch order to find

## Return fields

-   **billingAddress** (`MerchAddress`)
    Billing address

-   **completedAt** (`ISO8601DateTime`)
    Date the order was placed

-   **delivery** (`MerchOrderDelivery!`)
    How will the customer receive the order

-   **id** (`ID!`)
    The ID

-   **itemTotal** (`Float!`)
    Item total

-   **promoTotal** (`Float!`)
    Promotional discount

-   **quantity** (`Int!`)
    Order quantity

-   **shippingAddress** (`MerchAddress`)
    Shipping address

-   **status** (`MerchOrderStatus!`)
    Order status

-   **store** (`MerchStore!`)
    The merch store this order belongs to

-   **tax** (`Float!`)
    Taxes

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **total** (`Float!`)
    Total sale

-   **visualId** (`ID`)
    Visual ID Number
