# LineItem

Order item

## Implements

- [`IDed`](../interface/ided.md)
- [`Timestamps`](../interface/timestamps.md)

## Connections

### mockups (`MockupConnection!`)
The mockups

**Arguments**

| Argument | Type | Description |
| --- | --- | --- |
| `after` | `String` | Returns the elements in the list that come after the specified cursor. |
| `before` | `String` | Returns the elements in the list that come before the specified cursor. |
| `first` | `Int` | Returns the first _n_ elements from the list. |
| `last` | `Int` | Returns the last _n_ elements from the list. |

## Fields

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
