import gql from 'graphql-tag';

export const productQueries = {
  products: gql`
    query GetProducts($after: String, $before: String, $first: Int, $last: Int, $query: String!) {
      products(after: $after, before: $before, first: $first, last: $last, query: $query) {
        edges {
          node {
            id
            name
            description
            price
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  product: gql`
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        name
        description
        price
        createdAt
        updatedAt
      }
    }
  `,
};
