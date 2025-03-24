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