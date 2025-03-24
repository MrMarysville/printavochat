import gql from 'graphql-tag';

export const paymentMutations = {
  paymentRequestCreate: gql`
    mutation CreatePaymentRequest($parentId: ID!, $input: PaymentRequestCreateInput!) {
      paymentRequestCreate(parentId: $parentId, input: $input) {
        id
        // Include additional fields as needed, e.g., amount, status, createdAt, etc.
      }
    }
  `,
  feeCreate: gql`
    mutation CreateFee($parentId: ID!, $input: FeeInput!) {
      feeCreate(parentId: $parentId, input: $input) {
        id
        // Include additional fields as needed, e.g., fee amount, description, etc.
      }
    }
  `,
  feeUpdate: gql`
    mutation UpdateFee($id: ID!, $input: FeeInput!) {
      feeUpdate(id: $id, input: $input) {
        id
        // Include updated fields as needed.
      }
    }
  `,
  feeDelete: gql`
    mutation DeleteFee($id: ID!) {
      feedelete(id: $id) {
        id
      }
    }
  `,
};
