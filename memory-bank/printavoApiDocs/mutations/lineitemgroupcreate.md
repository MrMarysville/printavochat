# lineItemGroupCreate

Create a line item group

## Input fields

### input (`LineItemGroupCreateInput!`)
Values to create the line item group with

### parentId (`ID!`)
ID of quote or invoice to add this line item group to

## Return fields

### enabledColumns (`LineItemEnabledColumns!`)
Columns enabled for the group

### id (`ID!`)
The ID

### order (`OrderUnion!`)
Quote or Invoice this line item group belongs to

### position (`Int!`)
Order position

### timestamps (`ObjectTimestamps!`)
Object timestamps
