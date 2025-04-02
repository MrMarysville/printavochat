# account

Get account for the current user's session

## Return fields

- **address** (`Address`): Address
- **catalogInformation** (`CatalogInformation!`): What catalogs is the Account using?
- **companyEmail** (`String!`): Company email
- **companyName** (`String`): Company name
- **enabledLineItemGroupColumns** (`LineItemEnabledColumns!`): Default columns enabled for line item groups
- **features** (`[Feature!]!`): Features
- **id** (`ID!`): The ID
- **invoiceInformation** (`InvoiceInformation!`): Information about invoices
- **lineItemGroupSizes** (`[LineItemGroupSize!]!`): List of all line item sizes
- **locale** (`String!`): Locale
- **logoUrl** (`String`): Company Logo
- **paymentProcessorPresent** (`Boolean!`): Does the Account have a payment processor set up?
- **phone** (`String`): Phone number
- **timestamps** (`ObjectTimestamps!`): Object timestamps
- **website** (`String`): Website
