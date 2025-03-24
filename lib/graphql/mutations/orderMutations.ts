import gql from 'graphql-tag';

export const orderMutations = {
  quoteCreate: gql`
    mutation CreateQuote($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
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
  `,
  lineItemGroupCreate: gql`
    mutation CreateLineItemGroup($parentId: ID!, $input: LineItemGroupCreateInput!) {
      lineItemGroupCreate(parentId: $parentId, input: $input) {
        id
        name
        description
        notes
      }
    }
  `,
  lineItemCreate: gql`
    mutation CreateLineItem($lineItemGroupId: ID!, $input: LineItemCreateInput!) {
      lineItemCreate(lineItemGroupId: $lineItemGroupId, input: $input) {
        id
        name
        description
        quantity
        unitPrice
      }
    }
  `,
  customAddressCreate: gql`
    mutation CreateCustomAddress($parentId: ID!, $input: CustomAddressInput!) {
      customAddressCreate(parentId: $parentId, input: $input) {
        id
        name
        street1
        street2
        city
        state
        zipCode
        country
      }
    }
  `,
  invoiceUpdate: gql`
    mutation UpdateInvoice($id: ID!, $input: InvoiceUpdateInput!) {
      invoiceUpdate(id: $id, input: $input) {
        id
        name
        status {
          id
          name
        }
        customerNote
        productionNote
        customerDueAt
        tags
      }
    }
  `,
};
