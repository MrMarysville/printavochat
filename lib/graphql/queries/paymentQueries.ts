import gql from 'graphql-tag';

export const paymentQueries = {
  paymentRequests: gql`
    query GetPaymentRequests($after: String, $before: String, $first: Int, $last: Int) {
      paymentRequests(after: $after, before: $before, first: $first, last: $last) {
        edges {
          node {
            id
            # Add additional fields as necessary, e.g.,
            # amount, status, createdAt, etc.
          }
        }
      }
    }
  `,
  transaction: gql`
    query GetTransaction($id: ID!) {
      transaction(id: $id) {
        id
        # Add additional fields as necessary, e.g.,
        # type, amount, date, etc.
      }
    }
  `,
  transactionDetail: gql`
    query GetTransactionDetail($id: ID!) {
      transactionDetail(id: $id) {
        id
        # Add additional fields as necessary, e.g.,
        # details, items, total, etc.
      }
    }
  `,
};
