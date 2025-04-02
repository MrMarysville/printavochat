/**
 * Product model
 * 
 * Represents a product in the Supabase database from Printavo.
 */

/**
 * Interface for Product data in the Supabase database
 */
export interface Product {
  id: string;              // UUID primary key
  printavo_product_id: string;  // ID from Printavo
  brand: string | null;    // Brand name
  item_number: string | null;   // Product SKU or item number
  description: string | null;   // Product description
  color: string | null;    // Product color
  catalog: string | null;  // Catalog reference
  created_at: string;      // Timestamp of creation
  updated_at: string;      // Timestamp of last update
}

/**
 * Interface for input when creating or updating a product
 */
export interface ProductInput {
  printavo_product_id: string;
  brand?: string | null;
  item_number?: string | null;
  description?: string | null;
  color?: string | null;
  catalog?: string | null;
}

/**
 * Map a Printavo product to Supabase product format
 * 
 * @param printavoProduct Product data from Printavo API
 * @returns ProductInput for Supabase
 */
export function mapPrintavoProductToSupabase(printavoProduct: any): ProductInput {
  return {
    printavo_product_id: printavoProduct.id,
    brand: printavoProduct.brand || null,
    item_number: printavoProduct.itemNumber || null,
    description: printavoProduct.description || null,
    color: printavoProduct.color || null,
    catalog: printavoProduct.catalog?.name || null
  };
}

/**
 * Check if a product exists in Supabase by Printavo ID
 * 
 * @param supabase Supabase client
 * @param printavoProductId Printavo product ID
 * @returns Promise resolving to the product or null if not found
 */
export async function getProductByPrintavoId(
  supabase: any,
  printavoProductId: string
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('printavo_product_id', printavoProductId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // "The result contains 0 rows"
        return null;
      }
      throw error;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error getting product by Printavo ID:', error);
    return null;
  }
}

/**
 * Save a product to Supabase (create or update)
 * 
 * @param supabase Supabase client
 * @param productInput Product data to save
 * @returns Promise resolving to the saved product
 */
export async function saveProductToSupabase(
  supabase: any,
  productInput: ProductInput
): Promise<Product | null> {
  try {
    // Check if the product already exists
    const existingProduct = await getProductByPrintavoId(supabase, productInput.printavo_product_id);
    
    // Upsert the product (update if exists, insert if not)
    const { data, error } = await supabase
      .from('products')
      .upsert(
        {
          id: existingProduct?.id, // Include ID if existing, undefined if new
          ...productInput,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'printavo_product_id' }
      )
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Error saving product to Supabase:', error);
    return null;
  }
} 