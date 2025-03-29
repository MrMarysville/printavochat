export const queries = {
  account: `
    query account {
      account {
        id
        name
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  user: `
    query user {
      user {
        id
        email
        name
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  customer: `
    query customer($id: ID!) {
      customer(id: $id) {
        id
        companyName
        defaultPaymentTerm
        internalNote
        orderCount
        owner
        primaryContact {
          id
          fullName
          email
          phone
          fax
          firstName
          lastName
          orderCount
          timestamps {
            createdAt
            updatedAt
          }
        }
        publicUrl
        resaleNumber
        salesTax
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        taxExempt
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  contact: `
    query contact($id: ID!) {
      contact(id: $id) {
        id
        fullName
        email
        phone
        fax
        firstName
        lastName
        orderCount
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  order: `
    query order($id: ID!) {
      order(id: $id) {
        id
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
          phone
          fax
          firstName
          lastName
          orderCount
          timestamps {
            createdAt
            updatedAt
          }
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  quote: `
    query quote($id: ID!) {
      quote(id: $id) {
        id
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
          phone
          fax
          firstName
          lastName
          orderCount
          timestamps {
            createdAt
            updatedAt
          }
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  invoice: `
    query invoice($id: ID!) {
      invoice(id: $id) {
        id
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
          phone
          fax
          firstName
          lastName
          orderCount
          timestamps {
            createdAt
            updatedAt
          }
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  lineItem: `
    query lineItem($id: ID!) {
      lineItem(id: $id) {
        id
        category
        color
        description
        itemNumber
        items
        lineItemGroup {
          id
          enabledColumns
          order
          position
          timestamps {
            createdAt
            updatedAt
          }
        }
        markupPercentage
        merch
        personalizations
        poLineItem
        position
        price
        priceReceipt
        product
        productStatus
        sizes
        taxed
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  lineItemGroup: `
    query lineItemGroup($id: ID!) {
      lineItemGroup(id: $id) {
        id
        enabledColumns
        order
        position
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  status: `
    query status($id: ID!) {
      status(id: $id) {
        id
        name
        type
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  task: `
    query task($id: ID!) {
      task(id: $id) {
        id
        assignedTo
        completed
        completedAt
        completedBy
        dueAt
        name
        sourcePresetTaskGroupTitle
        taskable
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  inquiry: `
    query inquiry($id: ID!) {
      inquiry(id: $id) {
        id
        email
        name
        phone
        request
        timestamps {
          createdAt
          updatedAt
        }
        unread
      }
    }
  `,
  transaction: `
    query transaction($id: ID!) {
      transaction(id: $id) {
        id
        amount
        category
        description
        originatingPaymentTransaction
        processing
        source
        timestamps {
          createdAt
          updatedAt
        }
        transactedFor
        transactionDate
      }
    }
  `,
  merchStore: `
    query merchStore($id: ID!) {
      merchStore(id: $id) {
        id
        name
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  thread: `
    query thread($id: ID!) {
      thread(id: $id) {
        id
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  listOrders: `
    query listOrders($first: Int, $sortOn: String, $sortDescending: Boolean) {
      orders(first: $first, sortOn: $sortOn, sortDescending: $sortDescending) {
        nodes {
          id
          amountOutstanding
          amountPaid
          billingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          contact {
            id
            fullName
            email
            phone
            fax
            firstName
            lastName
            orderCount
            timestamps {
              createdAt
              updatedAt
            }
          }
          contractorProfile
          createdAt
          customerDueAt
          customerNote
          deliveryMethod
          discount
          discountAmount
          discountAsPercentage
          dueAt
          invoiceAt
          merch
          nickname
          owner
          packingSlipUrl
          paidInFull
          paymentDueAt
          paymentRequest
          paymentTerm
          productionNote
          publicHash
          publicPdf
          publicUrl
          salesTax
          salesTaxAmount
          shippingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          startAt
          status {
            id
            name
            type
            timestamps {
              createdAt
              updatedAt
            }
          }
          subtotal
          tags
          threadSummary
          timestamps {
            createdAt
            updatedAt
          }
          total
          totalQuantity
          totalUntaxed
          url
          visualId
          visualPoNumber
          workorderUrl
        }
      }
    }
  `,
  listInvoices: `
    query listInvoices($first: Int, $sortOn: String, $sortDescending: Boolean) {
      invoices(first: $first, sortOn: $sortOn, sortDescending: $sortDescending) {
        nodes {
          id
          amountOutstanding
          amountPaid
          billingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          contact {
            id
            fullName
            email
            phone
            fax
            firstName
            lastName
            orderCount
            timestamps {
              createdAt
              updatedAt
            }
          }
          contractorProfile
          createdAt
          customerDueAt
          customerNote
          deliveryMethod
          discount
          discountAmount
          discountAsPercentage
          dueAt
          invoiceAt
          merch
          nickname
          owner
          packingSlipUrl
          paidInFull
          paymentDueAt
          paymentRequest
          paymentTerm
          productionNote
          publicHash
          publicPdf
          publicUrl
          salesTax
          salesTaxAmount
          shippingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          startAt
          status {
            id
            name
            type
            timestamps {
              createdAt
              updatedAt
            }
          }
          subtotal
          tags
          threadSummary
          timestamps {
            createdAt
            updatedAt
          }
          total
          totalQuantity
          totalUntaxed
          url
          visualId
          visualPoNumber
          workorderUrl
        }
      }
    }
  `,
  listQuotes: `
    query listQuotes($first: Int, $sortOn: String, $sortDescending: Boolean) {
      quotes(first: $first, sortOn: $sortOn, sortDescending: $sortDescending) {
        nodes {
          id
          amountOutstanding
          amountPaid
          billingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          contact {
            id
            fullName
            email
            phone
            fax
            firstName
            lastName
            orderCount
            timestamps {
              createdAt
              updatedAt
            }
          }
          contractorProfile
          createdAt
          customerDueAt
          customerNote
          deliveryMethod
          discount
          discountAmount
          discountAsPercentage
          dueAt
          invoiceAt
          merch
          nickname
          owner
          packingSlipUrl
          paidInFull
          paymentDueAt
          paymentRequest
          paymentTerm
          productionNote
          publicHash
          publicPdf
          publicUrl
          salesTax
          salesTaxAmount
          shippingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          startAt
          status {
            id
            name
            type
            timestamps {
              createdAt
              updatedAt
            }
          }
          subtotal
          tags
          threadSummary
          timestamps {
            createdAt
            updatedAt
          }
          total
          totalQuantity
          totalUntaxed
          url
          visualId
          visualPoNumber
          workorderUrl
        }
      }
    }
  `,
  listCustomers: `
    query listCustomers($first: Int) {
      customers(first: $first) {
        nodes {
          id
          companyName
          defaultPaymentTerm
          internalNote
          orderCount
          owner
          primaryContact {
            id
            fullName
            email
            phone
            fax
            firstName
            lastName
            orderCount
            timestamps {
              createdAt
              updatedAt
            }
          }
          publicUrl
          resaleNumber
          salesTax
          shippingAddress {
            id
            address1
            address2
            city
            companyName
            country
            countryIso
            customerName
            name
            state
            stateIso
            zipCode
            timestamps {
              createdAt
              updatedAt
            }
          }
          taxExempt
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listContacts: `
    query listContacts($first: Int, $sortOn: String, $sortDescending: Boolean) {
      contacts(first: $first, sortOn: $sortOn, sortDescending: $sortDescending) {
        nodes {
          id
          fullName
          email
          phone
          fax
          firstName
          lastName
          orderCount
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listProducts: `
    query listProducts($first: Int, $query: String) {
      products(first: $first, query: $query) {
        nodes {
          id
          name
          description
          price
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listTasks: `
    query listTasks($first: Int, $sortOn: String, $sortDescending: Boolean) {
      tasks(first: $first, sortOn: $sortOn, sortDescending: $sortDescending) {
        nodes {
          id
          assignedTo
          completed
          completedAt
          completedBy
          dueAt
          name
          sourcePresetTaskGroupTitle
          taskable
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listInquiries: `
    query listInquiries($first: Int) {
      inquiries(first: $first) {
        nodes {
          id
          email
          name
          phone
          request
          timestamps {
            createdAt
            updatedAt
          }
          unread
        }
      }
    }
  `,
  listTransactions: `
    query listTransactions($first: Int) {
      transactions(first: $first) {
        nodes {
          id
          amount
          category
          description
          originatingPaymentTransaction
          processing
          source
          timestamps {
            createdAt
            updatedAt
          }
          transactedFor
          transactionDate
        }
      }
    }
  `,
  listMerchStores: `
    query listMerchStores($first: Int) {
      merchStores(first: $first) {
        nodes {
          id
          name
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listThreads: `
    query listThreads($first: Int) {
      threads(first: $first) {
        nodes {
          id
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  listStatuses: `
    query listStatuses($first: Int, $type: String) {
      statuses(first: $first, type: $type) {
        nodes {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `
};

export const mutations = {
  contactUpdate: `
    mutation contactUpdate($id: ID!, $input: ContactUpdateInput!) {
      contactUpdate(id: $id, input: $input) {
        id
        email
      }
    }
  `,
  invoiceUpdate: `
    mutation invoiceUpdate($id: ID!, $input: InvoiceUpdateInput!) {
      invoiceUpdate(id: $id, input: $input) {
        id
        contact {
          id
          fullName
          email
        }
        customerNote
        productionNote
        customerDueAt
        tags
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  lineItemCreates: `
    mutation lineItemCreates($input: [LineItemCreateInput!]!) {
      lineItemCreates(input: $input) {
        category
        color
        description
        id
        itemNumber
        items
        lineItemGroup {
          id
          enabledColumns
          order
          position
          timestamps {
            createdAt
            updatedAt
          }
        }
        markupPercentage
        merch
        personalizations
        poLineItem
        position
        price
        priceReceipt
        product
        productStatus
        sizes
        taxed
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  inquiryCreate: `
    mutation inquiryCreate($input: InquiryCreateInput!) {
      inquiryCreate(input: $input) {
        email
        id
        name
        phone
        request
        timestamps {
          createdAt
          updatedAt
        }
        unread
      }
    }
  `,
  transactionPaymentCreate: `
    mutation transactionPaymentCreate($input: TransactionPaymentCreateInput!) {
      transactionPaymentCreate(input: $input) {
        amount
        category
        description
        id
        originatingPaymentTransaction
        processing
        source
        timestamps {
          createdAt
          updatedAt
        }
        transactedFor
        transactionDate
      }
    }
  `,
  customAddressUpdate: `
    mutation customAddressUpdate($id: ID!, $input: CustomAddressUpdateInput!) {
      customAddressUpdate(id: $id, input: $input) {
        address1
        address2
        city
        companyName
        country
        countryIso
        customerName
        id
        name
        state
        stateIso
        timestamps {
          createdAt
          updatedAt
        }
        zipCode
      }
    }
  `,
  invoiceDuplicate: `
    mutation invoiceDuplicate($id: ID!) {
      invoiceDuplicate(id: $id) {
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        id
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  feeUpdate: `
    mutation feeUpdate($id: ID!, $input: FeeUpdateInput!) {
      feeUpdate(id: $id, input: $input) {
        amount
        description
        id
        quantity
        taxable
        timestamps {
          createdAt
          updatedAt
        }
        unitPrice
        unitPriceAsPercentage
      }
    }
  `,
  lineItemGroupUpdates: `
    mutation lineItemGroupUpdates($input: [LineItemGroupUpdateInput!]!) {
      lineItemGroupUpdates(input: $input) {
        enabledColumns
        id
        order
        position
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  feeUpdates: `
    mutation feeUpdates($input: [FeeUpdatesInput!]!) {
      feeUpdates(input: $input) {
        amount
        description
        id
        quantity
        taxable
        timestamps {
          createdAt
          updatedAt
        }
        unitPrice
        unitPriceAsPercentage
      }
    }
  `,
  imprintCreate: `
    mutation imprintCreate($input: ImprintCreateInput!, $lineItemGroupId: ID!) {
      imprintCreate(input: $input, lineItemGroupId: $lineItemGroupId) {
        details
        id
        pricingMatrixColumn
        timestamps {
          createdAt
          updatedAt
        }
        typeOfWork
      }
    }
  `,
  quoteDuplicate: `
    mutation quoteDuplicate($id: ID!) {
      quoteDuplicate(id: $id) {
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        id
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  customerUpdate: `
    mutation customerUpdate($id: ID!, $input: CustomerUpdateInput!) {
      customerUpdate(id: $id, input: $input) {
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        companyName
        defaultPaymentTerm
        id
        internalNote
        orderCount
        owner
        primaryContact {
          id
          fullName
          email
        }
        publicUrl
        resaleNumber
        salesTax
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        taxExempt
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  lineItemUpdate: `
    mutation lineItemUpdate($id: ID!, $input: LineItemUpdateInput!) {
      lineItemUpdate(id: $id, input: $input) {
        category
        color
        description
        id
        itemNumber
        items
        lineItemGroup {
          id
          enabledColumns
          order
          position
          timestamps {
            createdAt
            updatedAt
          }
        }
        markupPercentage
        merch
        personalizations
        poLineItem
        position
        price
        priceReceipt
        product
        productStatus
        sizes
        taxed
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  customAddressUpdates: `
    mutation customAddressUpdates($input: [CustomAddressUpdatesInput!]!) {
      customAddressUpdates(input: $input) {
        address1
        address2
        city
        companyName
        country
        countryIso
        customerName
        id
        name
        state
        stateIso
        timestamps {
          createdAt
          updatedAt
        }
        zipCode
      }
    }
  `,
  contactCreate: `
    mutation contactCreate($id: ID!, $input: ContactCreateInput!) {
      contactCreate(id: $id, input: $input) {
        customer {
          id
          companyName
        }
        email
        fax
        firstName
        fullName
        id
        lastName
        orderCount
        phone
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  imprintMockupCreate: `
    mutation imprintMockupCreate($imprintId: ID!, $publicImageUrl: String!) {
      imprintMockupCreate(imprintId: $imprintId, publicImageUrl: $publicImageUrl) {
        displayThumbnail
        fullImageUrl
        id
        mimeType
        thumbnailUrl
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  taskCreate: `
    mutation taskCreate($input: TaskCreateInput!) {
      taskCreate(input: $input) {
        assignedTo
        completed
        completedAt
        completedBy
        dueAt
        id
        name
        sourcePresetTaskGroupTitle
        taskable
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  lineItemCreate: `
    mutation lineItemCreate($input: LineItemCreateInput!, $lineItemGroupId: ID!) {
      lineItemCreate(input: $input, lineItemGroupId: $lineItemGroupId) {
        category
        color
        description
        id
        itemNumber
        items
        lineItemGroup {
          id
          enabledColumns
          order
          position
          timestamps {
            createdAt
            updatedAt
          }
        }
        markupPercentage
        merch
        personalizations
        poLineItem
        position
        price
        priceReceipt
        product
        productStatus
        sizes
        taxed
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  customerCreate: `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        companyName
        defaultPaymentTerm
        id
        internalNote
        orderCount
        owner
        primaryContact {
          id
          fullName
          email
        }
        publicUrl
        resaleNumber
        salesTax
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        taxExempt
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  quoteUpdate: `
    mutation quoteUpdate($id: ID!, $input: QuoteUpdateInput!) {
      quoteUpdate(id: $id, input: $input) {
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  customAddressCreate: `
    mutation customAddressCreate($input: CustomAddressInput!, $parentId: ID!) {
      customAddressCreate(input: $input, parentId: $parentId) {
        address1
        address2
        city
        companyName
        country
        countryIso
        customerName
        id
        name
        state
        stateIso
        timestamps {
          createdAt
          updatedAt
        }
        zipCode
      }
    }
  `,
  lineItemDelete: `
    mutation lineItemDelete($id: ID!) {
      lineItemDelete(id: $id) {
        id
      }
    }
  `,
  quoteCreate: `
    mutation quoteCreate($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
        amountOutstanding
        amountPaid
        billingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        contact {
          id
          fullName
          email
        }
        contractorProfile
        createdAt
        customerDueAt
        customerNote
        deliveryMethod
        discount
        discountAmount
        discountAsPercentage
        dueAt
        id
        invoiceAt
        merch
        nickname
        owner
        packingSlipUrl
        paidInFull
        paymentDueAt
        paymentRequest
        paymentTerm
        productionNote
        publicHash
        publicPdf
        publicUrl
        salesTax
        salesTaxAmount
        shippingAddress {
          id
          address1
          address2
          city
          companyName
          country
          countryIso
          customerName
          name
          state
          stateIso
          zipCode
          timestamps {
            createdAt
            updatedAt
          }
        }
        startAt
        status {
          id
          name
          type
          timestamps {
            createdAt
            updatedAt
          }
        }
        subtotal
        tags
        threadSummary
        timestamps {
          createdAt
          updatedAt
        }
        total
        totalQuantity
        totalUntaxed
        url
        visualId
        visualPoNumber
        workorderUrl
      }
    }
  `,
  statusUpdate: `
    mutation statusUpdate($parentId: ID!, $statusId: ID!) {
      statusUpdate(parentId: $parentId, statusId: $statusId) {
        statusUpdate
      }
    }
  `,
  productionFileCreate: `
    mutation productionFileCreate($parentId: ID!, $publicFileUrl: String!) {
      productionFileCreate(parentId: $parentId, publicFileUrl: $publicFileUrl) {
        fileUrl
        id
        mimeType
        name
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `,
  login: `
    mutation Login($email: String!, $password: String!, $deviceName: String!, $deviceToken: String) {
      login(email: $email, password: $password, deviceName: $deviceName, deviceToken: $deviceToken) {
        token
        user {
          id
          email
          name
          role
        }
      }
    }
  `
}; 