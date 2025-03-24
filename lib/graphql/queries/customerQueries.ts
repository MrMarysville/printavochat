import gql from 'graphql-tag';

export const customerQueries = {
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
  customers: gql`
    query SearchCustomers($after: String, $before: String, $first: Int, $last: Int) {
      customers(after: $after, before: $before, first: $first, last: $last) {
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
