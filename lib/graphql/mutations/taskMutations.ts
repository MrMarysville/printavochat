import gql from 'graphql-tag';

export const taskMutations = {
  taskCreate: gql`
    mutation CreateTask($input: TaskCreateInput!) {
      taskCreate(input: $input) {
        id
        title
        description
        status
        dueAt
        createdAt
        updatedAt
      }
    }
  `,
  threadUpdate: gql`
    mutation UpdateThread($id: ID!, $unread: Boolean!) {
      threadUpdate(id: $id, unread: $unread) {
        id
        unread
      }
    }
  `,
  approvalRequestCreate: gql`
    mutation CreateApprovalRequest($parentId: ID!, $input: ApprovalRequestCreateInput!) {
      approvalRequestCreate(parentId: $parentId, input: $input) {
        id
        status
        createdAt
      }
    }
  `,
};
