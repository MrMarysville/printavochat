import gql from 'graphql-tag';

export const CREATE_CUSTOMER = `
  mutation CreateCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      id
      companyName
      // Other fields...
    }
  }
`;

export const UPDATE_ORDER = `
  mutation UpdateOrder($id: ID!, $input: OrderUpdateInput!) {
    orderUpdate(id: $id, input: $input) {
      id
      visualId
      // Other fields...
    }
  }
`;

export const CREATE_TASK = `
  mutation CreateTask($input: TaskCreateInput!) {
    taskCreate(input: $input) {
      id
      name
      // Other fields...
    }
  }
`;
