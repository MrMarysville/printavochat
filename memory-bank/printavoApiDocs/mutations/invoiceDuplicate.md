# invoiceDuplicate

Duplicate an invoice

## Input fields

-   **id** (`ID!`)
    ID of invoice to duplicate

## Return fields

-   **amountOutstanding** (`Float`)
    Amount outstanding

-   **amountPaid** (`Float`)
    Amount paid

-   **billingaddress** (`CustomerAddress`)
    Billing address

-   **contact** (`Contact!`)
    Customer contact

-   **contractorprofile** (`ContractorProfile`)
    Contractor profile

-   **createdat** (`ISO8601Date!`)
    Created date

-   **customerdueat** (`ISO8601Date!`)
    Customer due date

-   **customernote** (`String`)
    Customer note

-   **deliverymethod** (`DeliveryMethod`)
    Delivery method

-   **discount** (`Float`)
    Discount

-   **discountamount** (`Float`)
    Discount Amount

-   **discountaspercentage** (`Boolean`)
    Discount is percentage?

-   **dueat** (`ISO8601DateTime`)
    Production due date

-   **id** (`ID!`)
    The ID

-   **invoiceat** (`ISO8601Date!`)
    Invoice date

-   **merch** (`Boolean!`)
    Is this from a merch order?

-   **nickname** (`String`)
    Nickname

-   **owner** (`User`)
    User who owns the order

-   **packingslipurl** (`String!`)
    Packing slip url

-   **paidinfull** (`Boolean!`)
    Paid in full?

-   **paymentdueat** (`ISO8601Date!`)
    Payment due date

-   **paymentrequest** (`PaymentRequest`)
    Payment request

-   **paymentterm** (`PaymentTerm`)
    Payment term

-   **productionnote** (`String`)
    Production notes

-   **publichash** (`String!`)
    Public hash

-   **publicpdf** (`String!`)
    Public pdf url

-   **publicurl** (`String!`)
    Public url

-   **salestax** (`Float`)
    Sales tax

-   **salestaxamount** (`Float`)
    Sales Tax Amount

-   **shippingaddress** (`CustomerAddress`)
    Shipping address

-   **startat** (`ISO8601DateTime!`)
    Start date

-   **status** (`Status!`)
    Status

-   **subtotal** (`Float`)
    Subtotal

-   **tags** (`[String!]!`)
    Tasks

-   **threadsummary** (`ThreadSummary`)
    Messages

-   **timestamps** (`ObjectTimestamps!`)
    Object timestamps

-   **total** (`Float`)
    Total

-   **totalquantity** (`Int`)
    Total quantity of items

-   **totaluntaxed** (`Float`)
    Total untaxed

-   **url** (`String!`)
    Url

-   **visualid** (`ID`)
    Quote #

-   **visualPoNumber** (`String`)
    PO Number

-   **workorderurl** (`String!`)
    Workorder url
