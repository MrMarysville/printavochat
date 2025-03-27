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
  orderByVisualId: gql`
    query GetOrderByVisualId($query: String!) {
      invoices(query: $query, first: 1) {
        edges {
          node {
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
        }
      }
    }
  `,
  invoices: gql`
    query SearchInvoices($query: String, $first: Int) {
      invoices(query: $query, first: $first) {
        edges {
          node {
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
  `,
  orders: gql`
    query SearchOrders($query: String, $first: Int) {
      orders(query: $query, first: $first) {
        edges {
          node {
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
  `,
  products: gql`
    query GetProducts($query: String!) {
      products(query: $query) {
        edges {
          node {
            id
            name
            description
            price
            category {
              id
              name
            }
            createdAt
            updatedAt
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
          }
        }
      }
    }
  `,
};

export const GET_ORDERS = `
  query GetOrders($first: Int, $sortDescending: Boolean) {
    orders(first: $first, sortDescending: $sortDescending) {
      nodes {
        id
        visualId
        // Other fields...
      }
    }
  }
`;

export const GET_ORDER = `
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      visualId
      // Other fields...
    }
  }
`;

export const SEARCH_ORDERS = `
  query SearchOrders($query: String!) {
    orders(query: $query, first: 10) {
      nodes {
        id
        visualId
        // Other fields...
      }
    }
  }
`;

export const GET_CUSTOMERS = `
  query GetCustomers($first: Int) {
    customers(first: $first) {
      nodes {
        id
        companyName
        // Other fields...
      }
    }
  }
`;

export const GET_CUSTOMER = `
  query GetCustomer($id: ID!) {
    customer(id: $id) {
      id
      companyName
      // Other fields...
    }
  }
`;
