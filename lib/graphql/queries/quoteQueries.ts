import gql from 'graphql-tag';

export const quoteQueries = {
  // Query for searching quotes with Visual ID
  searchQuotesByVisualId: gql`
    query SearchQuotesByVisualId($query: String!, $first: Int) {
      quotes(query: $query, first: $first) {
        edges {
          node {
            id
            visualId
            name
            orderNumber
            status {
              id
              name
            }
            customer {
              id
              name
              email
              phone
            }
            createdAt
            updatedAt
            total
            subtotal
            tax
            shipping
            discount
            notes
            lineItemGroups {
              id
              name
              description
              items {
                id
                name
                description
                quantity
                price
                style {
                  id
                  name
                  number
                  color
                  sizes {
                    id
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `,

  // Query for searching quotes with additional filters
  searchQuotes: gql`
    query SearchQuotes($query: String, $first: Int, $statusIds: [ID!], $sortOn: String, $sortDescending: Boolean) {
      quotes(
        query: $query,
        first: $first,
        statusIds: $statusIds,
        sortOn: $sortOn,
        sortDescending: $sortDescending
      ) {
        edges {
          node {
            id
            visualId
            name
            status {
              id
              name
            }
            customer {
              id
              name
              email
            }
            createdAt
            updatedAt
            total
          }
        }
      }
    }
  `,

  // Query for getting a quote by ID
  getQuoteById: gql`
    query GetQuote($id: ID!) {
      quote(id: $id) {
        id
        visualId
        name
        orderNumber
        status {
          id
          name
        }
        customer {
          id
          name
          email
          phone
        }
        createdAt
        updatedAt
        total
        subtotal
        tax
        shipping
        discount
        notes
        lineItemGroups {
          id
          name
          description
          items {
            id
            name
            description
            quantity
            price
            style {
              id
              name
              number
              color
              sizes {
                id
                name
                quantity
              }
            }
          }
        }
      }
    }
  `,
  
  // Mutation for creating a quote
  createQuote: gql`
    mutation CreateQuote($input: QuoteCreateInput!) {
      createQuote(input: $input) {
        quote {
          id
          visualId
          name
          status {
            id
            name
          }
          customer {
            id
            name
            email
          }
          createdAt
          total
          subtotal
          tax
          discount
        }
      }
    }
  `,
  
  // Mutation for adding a line item group to a quote
  addLineItemGroup: gql`
    mutation AddLineItemGroup($parentId: ID!, $input: LineItemGroupCreateInput!) {
      addLineItemGroup(parentId: $parentId, input: $input) {
        lineItemGroup {
          id
          name
          description
          items {
            id
            name
          }
        }
      }
    }
  `,
  
  // Mutation for adding a line item to a group
  addLineItem: gql`
    mutation AddLineItem($lineItemGroupId: ID!, $input: LineItemCreateInput!) {
      addLineItem(lineItemGroupId: $lineItemGroupId, input: $input) {
        lineItem {
          id
          name
          description
          quantity
          price
        }
      }
    }
  `,
  
  // Mutation for adding a custom address
  addCustomAddress: gql`
    mutation AddCustomAddress($quoteId: ID!, $input: AddressInput!) {
      addCustomAddress(quoteId: $quoteId, input: $input) {
        address {
          id
          name
          street1
          street2
          city
          state
          zip
          country
        }
      }
    }
  `,
  
  // Mutation for adding an imprint
  addImprint: gql`
    mutation AddImprint($lineItemGroupId: ID!, $input: ImprintCreateInput!) {
      addImprint(lineItemGroupId: $lineItemGroupId, input: $input) {
        imprint {
          id
          name
          location
          description
          colors
          price
        }
      }
    }
  `,
  
  // Mutation for updating a quote's status
  updateQuoteStatus: gql`
    mutation UpdateQuoteStatus($quoteId: ID!, $statusId: ID!) {
      updateQuoteStatus(quoteId: $quoteId, statusId: $statusId) {
        quote {
          id
          visualId
          status {
            id
            name
          }
          updatedAt
        }
      }
    }
  `,
  
  // Mutation for creating a complete quote
  createCompleteQuote: gql`
    mutation CreateCompleteQuote($input: CompleteQuoteInput!) {
      createCompleteQuote(input: $input) {
        quote {
          id
          visualId
          name
          status {
            id
            name
          }
          customer {
            id
            name
            email
          }
          createdAt
          total
          subtotal
          tax
          discount
          lineItemGroups {
            id
            name
            items {
              id
              name
              quantity
              price
            }
          }
        }
      }
    }
  `,
  
  // Mutation for calculating quote pricing
  calculateQuotePricing: gql`
    mutation CalculateQuotePricing($quoteId: ID!) {
      calculateQuotePricing(quoteId: $quoteId) {
        quote {
          id
          visualId
          subtotal
          tax
          shipping
          discount
          total
          lineItemGroups {
            id
            name
            items {
              id
              name
              quantity
              price
            }
          }
        }
      }
    }
  `,
  
  // Query for calculating quote total
  calculateQuoteTotal: gql`
    query CalculateQuoteTotal($quoteId: ID!) {
      calculateQuoteTotal(quoteId: $quoteId) {
        total
      }
    }
  `,
  
  // Mutation for creating a quote from products
  createQuoteFromProducts: gql`
    mutation CreateQuoteFromProducts($input: QuoteFromProductsInput!) {
      createQuoteFromProducts(input: $input) {
        quote {
          id
          visualId
          name
          status {
            id
            name
          }
          customer {
            id
            name
            email
          }
          createdAt
          total
          subtotal
          tax
          discount
          lineItemGroups {
            id
            name
            items {
              id
              name
              quantity
              price
            }
          }
        }
      }
    }
  `,
  
  // Mutation for creating an invoice
  createInvoice: gql`
    mutation CreateInvoice($input: InvoiceCreateInput!) {
      createInvoice(input: $input) {
        invoice {
          id
          visualId
          name
          status {
            id
            name
          }
          customer {
            id
            name
            email
          }
          createdAt
          total
          subtotal
          tax
          discount
          lineItemGroups {
            id
            name
          }
        }
      }
    }
  `
};