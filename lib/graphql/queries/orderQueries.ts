import gql from 'graphql-tag';

export const orderQueries = {
  order: gql`
    query GetOrder($id: ID!) {
      order(id: $id) {
        ... on Quote {
          id
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
        ... on Invoice {
          id
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
  `,
  orders: gql`
    query SearchOrders($query: String) {
      orders(query: $query) {
        edges {
          node {
            ... on Quote {
              id
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
            ... on Invoice {
              id
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
    }
  `,
  orderByVisualId: gql`
    query GetOrderByVisualId($query: String!) {
      invoices(query: $query, first: 1) {
        edges {
          node {
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
    }
  `,
};
