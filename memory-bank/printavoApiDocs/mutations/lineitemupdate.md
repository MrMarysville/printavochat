# lineItemUpdate

Update a line item

## Input fields

### id (`ID!`)
ID of line item to update

### input (`LineItemInput!`)
Values to update the line item with

## Return fields

### category (`Category`)
Category

### color (`String`)
Color

### description (`String`)
Description

### id (`ID!`)
The ID

### itemNumber (`String`)
Item #

### items (`Int!`)
Total quantities

### lineItemGroup (`LineItemGroup!`)
The line item group this belongs to

### markupPercentage (`Float`)
When not null, override the matrix's markup percentage for the product

### merch (`Boolean!`)
Is this from a merch order?

### personalizations (`[Personalization!]`)
Personalizations

### poLineItem (`PoLineItem`)
Purchase order line item

### position (`Int!`)
Position

### price (`Float`)
Price per item

### priceReceipt (`LineItemPriceReceipt`)
Price receipt showing how price was calculated

### product (`Product`)
Product

### productStatus (`LineItemStatus`)
Product status

### sizes (`[LineItemSizeCount!]!`)
Size counts

### taxed (`Boolean!`)
Taxable?

### timestamps (`ObjectTimestamps!`)
Object timestamps
