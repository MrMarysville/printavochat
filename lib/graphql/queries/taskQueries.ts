import gql from 'graphql-tag';

export const taskQueries = {
  task: gql`
    query GetTask($id: ID!) {
      task(id: $id) {
        id
        title
        description
        status
        dueDate
        createdAt
        updatedAt
      }
    }
  `,
  tasks: gql`
    query GetTasks($after: String, $before: String, $first: Int, $last: Int, $completed: Boolean) {
      tasks(after: $after, before: $before, first: $first, last: $last, completed: $completed) {
        edges {
          node {
            id
            title
            status
            dueDate
          }
        }
      }
    }
  `,
  thread: gql`
    query GetThread($id: ID!) {
      thread(id: $id) {
        id
        messages {
          id
          content
          sender {
            id
            name
          }
          createdAt
        }
      }
    }
  `,
  threads: gql`
    query GetThreads($after: String, $before: String, $first: Int, $last: Int) {
      threads(after: $after, before: $before, first: $first, last: $last) {
        edges {
          node {
            id
            latestMessage {
              id
              content
              createdAt
            }
          }
        }
      }
    }
  `,
};
