import gql from 'graphql-tag';

export const customerMutations = {
  customerCreate: gql`
    mutation CreateCustomer($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        id
        name
        email
        phone
        company
        createdAt
        updatedAt
      }
    }
  `,
  contactUpdate: gql`
    mutation UpdateContact($id: ID!, $input: ContactUpdateInput!) {
      contactUpdate(id: $id, input: $input) {
        id
        name
        email
        phone
        company
        updatedAt
      }
    }
  `,
};
