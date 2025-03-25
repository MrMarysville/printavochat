import gql from 'graphql-tag';

// Shared fragment for common order fields
const orderFields = gql`
  fragment OrderFields on Order {
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
`;

// Unified search query that works across all order types
export const searchQueries = {
  unifiedOrderSearch: gql`
    ${orderFields}
    query UnifiedOrderSearch(
      $query: String
      $visualId: String
      $first: Int
      $after: String
      $before: String
      $statusIds: [ID!]
      $inProductionAfter: DateTime
      $inProductionBefore: DateTime
      $sortOn: String
      $sortDescending: Boolean
    ) {
      orders: allOrders(
        query: $query
        visualId: $visualId
        first: $first
        after: $after
        before: $before
        statusIds: $statusIds
        inProductionAfter: $inProductionAfter
        inProductionBefore: $inProductionBefore
        sortOn: $sortOn
        sortDescending: $sortDescending
      ) {
        edges {
          cursor
          node {
            __typename
            ... on Order {
              ...OrderFields
            }
            ... on Quote {
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
              quoteSpecificField
            }
            ... on Invoice {
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
              dueDate
              paymentTerms
              paymentStatus
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `,

  // Visual ID specific search with optimized fields
  visualIdSearch: gql`
    query VisualIdSearch($visualId: String!) {
      orders: allOrders(visualId: $visualId, first: 1) {
        edges {
          node {
            __typename
            ... on Order {
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
            ... on Quote {
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
              quoteSpecificField
            }
            ... on Invoice {
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
              dueDate
              paymentTerms
              paymentStatus
            }
          }
        }
      }
    }
  `,

  // Customer search with proper parameters
  customerSearch: gql`
    query CustomerSearch(
      $query: String
      $first: Int
      $after: String
      $before: String
      $sortOn: String
      $sortDescending: Boolean
      $primaryOnly: Boolean
    ) {
      customers(
        query: $query
        first: $first
        after: $after
        before: $before
        sortOn: $sortOn
        sortDescending: $sortDescending
        primaryOnly: $primaryOnly
      ) {
        edges {
          cursor
          node {
            id
            name
            email
            phone
            companyName
            billingAddress {
              id
              address1
              address2
              city
              state
              zipCode
              country
            }
            shippingAddress {
              id
              address1
              address2
              city
              state
              zipCode
              country
            }
            createdAt
            updatedAt
            orderCount
            totalSpent
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `
};