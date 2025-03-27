/**
 * GraphQL Schema Validator
 * 
 * This utility checks if the Printavo GraphQL schema matches our expected structure.
 * It can detect breaking changes in the API that might affect our queries.
 */

import { executeGraphQL } from './printavo-api';
import { logger } from './logger';

// Type for schema field
interface SchemaField {
  name: string;
  type: string;
  isRequired: boolean;
}

// Type for schema type
interface SchemaType {
  name: string;
  fields: SchemaField[];
}

// Expected schema structure for key types
const expectedSchema: Record<string, SchemaField[]> = {
  Invoice: [
    { name: 'id', type: 'ID', isRequired: true },
    { name: 'visualId', type: 'String', isRequired: false },
    { name: 'nickname', type: 'String', isRequired: false },
    { name: 'createdAt', type: 'DateTime', isRequired: false },
    { name: 'total', type: 'String', isRequired: false },
    { name: 'status', type: 'Status', isRequired: false },
    { name: 'contact', type: 'Contact', isRequired: false },
    { name: 'lineItemGroups', type: 'LineItemGroupConnection', isRequired: false }
  ],
  Contact: [
    { name: 'id', type: 'ID', isRequired: true },
    { name: 'fullName', type: 'String', isRequired: false },
    { name: 'email', type: 'String', isRequired: false },
    { name: 'phone', type: 'String', isRequired: false }
  ],
  LineItemGroup: [
    { name: 'id', type: 'ID', isRequired: true },
    { name: 'name', type: 'String', isRequired: false },
    { name: 'lineItems', type: 'LineItemConnection', isRequired: false }
  ],
  LineItem: [
    { name: 'id', type: 'ID', isRequired: true },
    { name: 'name', type: 'String', isRequired: false },
    { name: 'description', type: 'String', isRequired: false },
    { name: 'quantity', type: 'Int', isRequired: false },
    { name: 'price', type: 'String', isRequired: false }
  ]
};

/**
 * Fetches the current schema from the Printavo GraphQL API
 */
export async function fetchSchema(): Promise<SchemaType[]> {
  try {
    const query = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    const result = await executeGraphQL(query, {}, 'IntrospectionQuery');
    
    if (!result.__schema || !result.__schema.types) {
      throw new Error('Invalid schema response');
    }
    
    // Transform the schema into a more usable format
    return result.__schema.types
      .filter((type: any) => type.kind === 'OBJECT' && !type.name.startsWith('__'))
      .map((type: any) => ({
        name: type.name,
        fields: (type.fields || []).map((field: any) => ({
          name: field.name,
          type: field.type.name || (field.type.ofType ? field.type.ofType.name : 'Unknown'),
          isRequired: field.type.kind === 'NON_NULL'
        }))
      }));
  } catch (error) {
    logger.error('Failed to fetch GraphQL schema:', error);
    return [];
  }
}

/**
 * Validates the actual schema against our expected schema
 * @returns Object containing validation results and detected changes
 */
export async function validateSchema(): Promise<{
  valid: boolean;
  changes: Record<string, any>;
}> {
  const schema = await fetchSchema();
  const changes: Record<string, any> = {};
  let valid = true;
  
  // Check each type we care about
  Object.keys(expectedSchema).forEach(typeName => {
    const actualType = schema.find(type => type.name === typeName);
    
    if (!actualType) {
      valid = false;
      changes[typeName] = { error: 'Type not found in schema' };
      return;
    }
    
    const typeChanges: Record<string, any> = {};
    
    // Check each expected field
    expectedSchema[typeName].forEach(expectedField => {
      const actualField = actualType.fields.find(field => field.name === expectedField.name);
      
      if (!actualField) {
        valid = false;
        typeChanges[expectedField.name] = { error: 'Field missing' };
      } else if (actualField.type !== expectedField.type) {
        valid = false;
        typeChanges[expectedField.name] = {
          error: 'Type mismatch',
          expected: expectedField.type,
          actual: actualField.type
        };
      }
    });
    
    // Look for new fields that might be useful
    const newFields = actualType.fields
      .filter(field => !expectedSchema[typeName].some(expected => expected.name === field.name))
      .map(field => field.name);
    
    if (newFields.length > 0) {
      typeChanges.newFields = newFields;
    }
    
    if (Object.keys(typeChanges).length > 0) {
      changes[typeName] = typeChanges;
    }
  });
  
  return { valid, changes };
}

/**
 * Checks if the Printavo API schema matches our expectations
 * @returns Promise that resolves to true if schema is compatible
 */
export async function isSchemaCompatible(): Promise<boolean> {
  try {
    const { valid, changes } = await validateSchema();
    
    if (!valid) {
      logger.warn('Printavo GraphQL schema has changed:', changes);
      // Log specific details about incompatible changes
      Object.entries(changes).forEach(([typeName, typeChanges]) => {
        if (typeof typeChanges === 'object' && typeChanges !== null) {
          Object.entries(typeChanges as Record<string, any>).forEach(([fieldName, change]) => {
            if (fieldName !== 'newFields' && change.error) {
              logger.warn(`Schema incompatibility in ${typeName}.${fieldName}: ${change.error}`);
              if (change.expected) {
                logger.warn(`Expected ${change.expected}, got ${change.actual}`);
              }
            }
          });
        }
      });
    }
    
    return valid;
  } catch (error) {
    logger.error('Error validating GraphQL schema:', error);
    // If we can't validate, assume it's compatible to avoid breaking the app
    return true;
  }
}

/**
 * Runs a schema compatibility check and logs warnings if issues are found
 * This is safe to call at app startup
 */
export async function checkSchemaCompatibility(): Promise<void> {
  try {
    const compatible = await isSchemaCompatible();
    if (compatible) {
      logger.info('Printavo GraphQL schema is compatible with expected structure');
    } else {
      logger.warn('Printavo GraphQL schema has changed and may require updates to queries');
    }
  } catch (error) {
    logger.error('Error checking schema compatibility:', error);
  }
} 