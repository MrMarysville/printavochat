/**
 * GraphQL queries for Printavo API.
 */

export const queries = {
  // Account information
  GET_ACCOUNT: `
    query GetAccount {
      account {
        id
        name
        subdomain
        timeZone
        country
        state
      }
    }
  `,
  
  GET_CURRENT_USER: `
    query GetCurrentUser {
      currentUser {
        id
        email
        firstName
        lastName
        fullName
        role
      }
    }
  `,
  
  // Orders
  GET_ORDER: `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        name
        visualId
        createdAt
        updatedAt
        dueDate
        status {
          id
          name
          color
        }
        customer {
          id
          name
          email
          phone
        }
        lineItemGroups(first: 10) {
          edges {
            node {
              id
              name
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    name
                    description
                    quantity
                    price
                    total
                  }
                }
              }
            }
          }
        }
        lineItems(first: 20) {
          edges {
            node {
              id
              name
              description
              quantity
              price
              total
            }
          }
        }
        notes
        productionNotes
        total
        depositTotal
        depositDue
        balanceRemaining
      }
    }
  `,
  
  GET_ORDER_BY_VISUAL_ID: `
    query GetOrderByVisualId($visualId: String!) {
      invoices(first: 1, filter: { visualIds: [$visualId] }) {
        edges {
          node {
            id
            name
            visualId
            createdAt
            updatedAt
            dueDate
            status {
              id
              name
              color
            }
            customer {
              id
              name
              email
              phone
            }
            lineItemGroups(first: 10) {
              edges {
                node {
                  id
                  name
                  lineItems(first: 20) {
                    edges {
                      node {
                        id
                        name
                        description
                        quantity
                        price
                        total
                      }
                    }
                  }
                }
              }
            }
            lineItems(first: 20) {
              edges {
                node {
                  id
                  name
                  description
                  quantity
                  price
                  total
                }
              }
            }
            notes
            productionNotes
            total
            depositTotal
            depositDue
            balanceRemaining
          }
        }
      }
    }
  `,
  
  SEARCH_ORDERS: `
    query SearchOrders($query: String!) {
      orders(first: 10, query: $query) {
        edges {
          node {
            id
            name
            visualId
            createdAt
            updatedAt
            dueDate
            status {
              id
              name
              color
            }
            customer {
              id
              name
              email
            }
            total
          }
        }
      }
    }
  `,
  
  LIST_ORDERS: `
    query ListOrders($first: Int!, $after: String, $sortOn: String) {
      orders(first: $first, after: $after, sortOn: $sortOn) {
        nodes {
          id
          name
          visualId
          createdAt
          updatedAt
          dueDate
          status {
            id
            name
            color
          }
          customer {
            id
            name
            email
          }
          total
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  // Customers
  GET_CUSTOMER: `
    query GetCustomer($id: ID!) {
      customer(id: $id) {
        id
        name
        email
        phone
        address
        notes
        contacts(first: 5) {
          edges {
            node {
              id
              name
              email
              phone
              isPrimary
            }
          }
        }
      }
    }
  `,
  
  SEARCH_CUSTOMERS: `
    query SearchCustomers($query: String!) {
      customers(first: 10, query: $query) {
        edges {
          node {
            id
            name
            email
            phone
            address
            notes
          }
        }
      }
    }
  `,
  
  CREATE_CUSTOMER: `
    mutation CreateCustomer($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          name
          email
          phone
          address
          notes
        }
      }
    }
  `,
  
  // Quotes
  GET_QUOTE: `
    query GetQuote($id: ID!) {
      quote(id: $id) {
        id
        name
        visualId
        createdAt
        updatedAt
        dueDate
        status {
          id
          name
          color
        }
        customer {
          id
          name
          email
          phone
        }
        lineItemGroups(first: 10) {
          edges {
            node {
              id
              name
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    name
                    description
                    quantity
                    price
                    total
                  }
                }
              }
            }
          }
        }
        lineItems(first: 20) {
          edges {
            node {
              id
              name
              description
              quantity
              price
              total
            }
          }
        }
        notes
        productionNotes
        total
      }
    }
  `,
  
  CREATE_QUOTE: `
    mutation CreateQuote($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
        quote {
          id
          name
          visualId
          createdAt
          customer {
            id
            name
          }
          status {
            id
            name
          }
        }
      }
    }
  `,
  
  CREATE_LINE_ITEM: `
    mutation CreateLineItem($input: LineItemCreateInput!) {
      lineItemCreate(input: $input) {
        lineItem {
          id
          name
          description
          quantity
          price
          total
        }
      }
    }
  `,
  
  // Statuses
  UPDATE_STATUS: `
    mutation UpdateStatus($input: StatusUpdateInput!) {
      statusUpdate(input: $input) {
        order {
          id
          status {
            id
            name
            color
          }
        }
        quote {
          id
          status {
            id
            name
            color
          }
        }
        invoice {
          id
          status {
            id
            name
            color
          }
        }
      }
    }
  `,
  
  LIST_STATUSES: `
    query ListStatuses($type: String) {
      statuses(first: 50, filter: { type: $type }) {
        edges {
          node {
            id
            name
            color
            type
          }
        }
      }
    }
  `,

  // Additional queries for full parity
  
  // Invoices
  GET_INVOICE: `
    query GetInvoice($id: ID!) {
      invoice(id: $id) {
        id
        name
        visualId
        createdAt
        updatedAt
        dueDate
        status {
          id
          name
          color
        }
        customer {
          id
          name
          email
          phone
        }
        lineItemGroups(first: 10) {
          edges {
            node {
              id
              name
              lineItems(first: 20) {
                edges {
                  node {
                    id
                    name
                    description
                    quantity
                    price
                    total
                  }
                }
              }
            }
          }
        }
        lineItems(first: 20) {
          edges {
            node {
              id
              name
              description
              quantity
              price
              total
            }
          }
        }
        notes
        productionNotes
        total
        depositTotal
        depositDue
        balanceRemaining
        paymentStatus
      }
    }
  `,
  
  LIST_INVOICES: `
    query ListInvoices($first: Int!, $after: String) {
      invoices(first: $first, after: $after) {
        edges {
          node {
            id
            name
            visualId
            createdAt
            updatedAt
            dueDate
            status {
              id
              name
              color
            }
            customer {
              id
              name
              email
            }
            total
            paymentStatus
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  CONVERT_QUOTE_TO_INVOICE: `
    mutation ConvertQuoteToInvoice($input: QuoteDuplicateAsInvoiceInput!) {
      quoteDuplicateAsInvoice(input: $input) {
        invoice {
          id
          name
          visualId
          createdAt
          status {
            id
            name
          }
          customer {
            id
            name
          }
          total
        }
      }
    }
  `,
  
  // Customers and Contacts
  LIST_CUSTOMERS: `
    query ListCustomers($first: Int!, $after: String) {
      customers(first: $first, after: $after) {
        edges {
          node {
            id
            name
            email
            phone
            address
            notes
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  UPDATE_CUSTOMER: `
    mutation UpdateCustomer($input: CustomerUpdateInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          name
          email
          phone
          address
          notes
        }
      }
    }
  `,
  
  GET_CONTACT: `
    query GetContact($id: ID!) {
      contact(id: $id) {
        id
        name
        email
        phone
        isPrimary
        customer {
          id
          name
        }
      }
    }
  `,
  
  LIST_CONTACTS: `
    query ListContacts($customerId: ID!, $first: Int!) {
      customer(id: $customerId) {
        contacts(first: $first) {
          edges {
            node {
              id
              name
              email
              phone
              isPrimary
            }
          }
        }
      }
    }
  `,
  
  CREATE_CONTACT: `
    mutation CreateContact($input: ContactCreateInput!) {
      contactCreate(input: $input) {
        contact {
          id
          name
          email
          phone
          isPrimary
          customer {
            id
            name
          }
        }
      }
    }
  `,
  
  UPDATE_CONTACT: `
    mutation UpdateContact($input: ContactUpdateInput!) {
      contactUpdate(input: $input) {
        contact {
          id
          name
          email
          phone
          isPrimary
        }
      }
    }
  `,
  
  // Products
  GET_PRODUCT: `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        name
        description
        sku
        price
        cost
        vendor
        category
        color
        size
      }
    }
  `,
  
  LIST_PRODUCTS: `
    query ListProducts($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        edges {
          node {
            id
            name
            description
            sku
            price
            cost
            vendor
            category
            color
            size
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  // Quote Management
  UPDATE_QUOTE: `
    mutation UpdateQuote($input: QuoteUpdateInput!) {
      quoteUpdate(input: $input) {
        quote {
          id
          name
          visualId
          createdAt
          updatedAt
          dueDate
          status {
            id
            name
          }
          customer {
            id
            name
          }
          total
        }
      }
    }
  `,
  
  DUPLICATE_QUOTE: `
    mutation DuplicateQuote($input: QuoteDuplicateInput!) {
      quoteDuplicate(input: $input) {
        quote {
          id
          name
          visualId
          createdAt
          status {
            id
            name
          }
          customer {
            id
            name
          }
          total
        }
      }
    }
  `,
  
  // LineItem Management
  UPDATE_LINE_ITEM: `
    mutation UpdateLineItem($input: LineItemUpdateInput!) {
      lineItemUpdate(input: $input) {
        lineItem {
          id
          name
          description
          quantity
          price
          total
        }
      }
    }
  `,
  
  DELETE_LINE_ITEM: `
    mutation DeleteLineItem($input: LineItemDeleteInput!) {
      lineItemDelete(input: $input) {
        success
      }
    }
  `,
  
  // Tasks and Inquiries
  GET_TASK: `
    query GetTask($id: ID!) {
      task(id: $id) {
        id
        title
        description
        dueDate
        status
        assignedTo {
          id
          name
        }
      }
    }
  `,
  
  LIST_TASKS: `
    query ListTasks($first: Int!, $after: String) {
      tasks(first: $first, after: $after) {
        edges {
          node {
            id
            title
            description
            dueDate
            status
            assignedTo {
              id
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  CREATE_TASK: `
    mutation CreateTask($input: TaskCreateInput!) {
      taskCreate(input: $input) {
        task {
          id
          title
          description
          dueDate
          status
          assignedTo {
            id
            name
          }
        }
      }
    }
  `,
  
  GET_INQUIRY: `
    query GetInquiry($id: ID!) {
      inquiry(id: $id) {
        id
        name
        email
        phone
        message
        createdAt
        status
      }
    }
  `,
  
  LIST_INQUIRIES: `
    query ListInquiries($first: Int!, $after: String) {
      inquiries(first: $first, after: $after) {
        edges {
          node {
            id
            name
            email
            phone
            message
            createdAt
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  
  // Payment Management
  CREATE_PAYMENT: `
    mutation CreatePayment($input: TransactionCreateInput!) {
      transactionCreate(input: $input) {
        transaction {
          id
          amount
          date
          paymentMethod
          status
          order {
            id
            visualId
            balanceRemaining
          }
        }
      }
    }
  `,
  
  LIST_PAYMENTS: `
    query ListPayments($orderId: ID!, $first: Int!) {
      order(id: $orderId) {
        transactions(first: $first) {
          edges {
            node {
              id
              amount
              date
              paymentMethod
              status
            }
          }
        }
      }
    }
  `
}; 