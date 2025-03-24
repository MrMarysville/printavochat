import gql from 'graphql-tag';

export const productMutations = {
  productCreate: gql`
    mutation CreateProduct($input: ProductCreateInput!) {
      productCreate(input: $input) {
        id
        name
        description
        price
        createdAt
        updatedAt
      }
    }
  `,
  productUpdate: gql`
    mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
      productUpdate(id: $id, input: $input) {
        id
        name
        description
        price
        updatedAt
      }
    }
  `,
};
