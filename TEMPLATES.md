# Quote Templates Guide

Quote templates save time by pre-filling common order configurations while allowing customization for each customer's specific needs.

## Using Templates

### Viewing Available Templates

To see what templates are available, simply ask:
- "Show me available templates"
- "List quote templates"
- "What templates do we have?"

### Template Details

To view what's in a specific template:
- "What's in the Corporate Package template?"
- "Show me details of Standard T-Shirt Order"
- "Tell me about the Team Sports Package"

### Creating Quotes from Templates

Create quotes quickly using templates:
- "Create a quote for King Clothing using the Corporate Package template"
- "Start a new quote from Standard T-Shirt Order for ABC Company"
- "Make Team Sports Package quote for City High School"

The system will retrieve the template contents, customize it for the specified customer, and create a quote automatically. You can then review and modify any details before finalizing.

### Saving Templates

Save any quote as a template for future use:
- "Save this quote as a template called Monthly Reorder"
- "Create a template from this quote"

## Template Contents

Each template includes:

- **Line Items**: Products with pre-filled quantities and pricing
- **SanMar Integration**: Style numbers for automatic product details lookup
- **Customization Notes**: Standard decoration instructions
- **Default Notes**: Standard production information

## Pre-loaded Templates

The system comes with several starter templates:

### Standard T-Shirt Order
Basic t-shirt order with screen printing options. Includes 24 PC61 Essential T-Shirts with front and back printing.

### Corporate Package
Business apparel with embroidered logos. Includes polos and soft shell jackets with left chest embroidery.

### Team Sports Package
Complete team uniform package with performance shirts and shorts. Includes sublimation printing and player customization options.

## Best Practices

1. **Create Templates for Common Orders**: Identify frequently ordered products and create templates to save time.

2. **Use Specific Template Names**: Name templates clearly based on their purpose (e.g., "Spring Baseball Uniforms 2025").

3. **Include Detailed Descriptions**: Add sufficient context in template descriptions to help users understand when to use them.

4. **Update Pricing Regularly**: Review and update template pricing periodically to reflect current costs.

5. **Customer-Specific Templates**: Create templates for specific customers' recurring orders.

## Template Management (Admin)

Templates are stored as JSON files in the `data/templates` directory. Advanced users can:

- Manually edit template files for bulk updates
- Back up templates by copying this directory
- Transfer templates between installations

For any questions about using templates, just ask "How do I use templates?" in the chat interface for detailed guidance. 