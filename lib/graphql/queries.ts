import gql from 'graphql-tag';

export const QUERIES = {
  customer: gql`
    query GetCustomer($id: ID!) {
      customer(id: $id) {
        id
        name
        email
        phone
        createdAt
        updatedAt
      }
    }
  `,
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
  customers: gql`
    query SearchCustomers($query: String!) {
      customers(query: $query) {
        edges {
          node {
            id
            name
            email
            phone
            createdAt
            updatedAt
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
  products: gql`
    query SearchProducts($query: String!) {
      products(query: $query) {
        edges {
          node {
            id
            name
            description
            price
          }
        }
      }
    }
  `,
  orderByVisualId: gql`
    query GetOrderByVisualId($query: String!) {
      orders(query: $query, sortOn: VISUAL_ID, first: 1) {
        nodes {
          ... on Quote {
            id
            visualId
            name
            status
            createdAt
            updatedAt
          }
          ... on Invoice {
            id
            visualId
            name
            status
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
};
