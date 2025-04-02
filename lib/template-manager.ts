import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

// Template types
export interface QuoteLineItem {
  product: string;
  description?: string;
  quantity: number;
  price: number;
  color?: string;
  sizes?: Record<string, number>;
  styleNumber?: string;
  customization?: string;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lineItems: QuoteLineItem[];
  defaultNotes?: string;
  tags?: string[];
  settings?: Record<string, any>;
}

// Template storage path
const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

/**
 * Template Manager class for handling quote templates
 */
export class TemplateManager {
  private templates: Map<string, QuoteTemplate> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize the template manager and load templates from disk
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Create templates directory if it doesn't exist
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
      
      // Load all template files
      const files = fs.readdirSync(TEMPLATES_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(TEMPLATES_DIR, file);
            const templateData = fs.readFileSync(filePath, 'utf8');
            const template = JSON.parse(templateData) as QuoteTemplate;
            
            // Validate the template
            if (this.validateTemplate(template)) {
              this.templates.set(template.id, template);
            }
          } catch (error) {
            logger.error(`Error loading template ${file}:`, error);
          }
        }
      }
      
      // Load sample templates if none exist
      if (this.templates.size === 0) {
        await this.createSampleTemplates();
      }
      
      this.initialized = true;
      logger.info(`Loaded ${this.templates.size} quote templates`);
    } catch (error) {
      logger.error('Error initializing TemplateManager:', error);
      throw error;
    }
  }
  
  /**
   * Validate a template object
   */
  private validateTemplate(template: any): boolean {
    if (!template.id || !template.name || !Array.isArray(template.lineItems)) {
      return false;
    }
    
    // Check that line items have required fields
    for (const item of template.lineItems) {
      if (!item.product || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Create sample templates if none exist
   */
  private async createSampleTemplates(): Promise<void> {
    const sampleTemplates: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Standard T-Shirt Order',
        description: 'Basic t-shirt order template with standard options',
        lineItems: [
          {
            product: 'PC61 Essential T-Shirt',
            description: 'Port & Company Essential T-Shirt with screen print',
            quantity: 24,
            price: 12.99,
            styleNumber: 'PC61',
            customization: 'Screen print on front and back'
          }
        ],
        defaultNotes: 'Standard 7-10 business day turnaround time.',
        tags: ['basic', 't-shirt', 'screen-print']
      },
      {
        name: 'Corporate Package',
        description: 'Corporate branded apparel package with polos and jackets',
        lineItems: [
          {
            product: 'K500 Silk Touch Polo',
            description: 'Port Authority Silk Touch Polo with embroidered logo',
            quantity: 12,
            price: 24.99,
            styleNumber: 'K500',
            customization: 'Embroidered logo on left chest'
          },
          {
            product: 'J317 Soft Shell Jacket',
            description: 'Port Authority Soft Shell Jacket with embroidered logo',
            quantity: 6,
            price: 49.99,
            styleNumber: 'J317',
            customization: 'Embroidered logo on left chest'
          }
        ],
        defaultNotes: 'Corporate embroidery package with premium options. 14 day turnaround.',
        tags: ['corporate', 'embroidery', 'premium']
      },
      {
        name: 'Team Sports Package',
        description: 'Complete team uniform package with jerseys and accessories',
        lineItems: [
          {
            product: 'ST350 PosiCharge Competitor Tee',
            description: 'Sport-Tek Performance T-Shirt with numbers and names',
            quantity: 15,
            price: 18.99,
            styleNumber: 'ST350',
            customization: 'Full custom sublimation with player names and numbers'
          },
          {
            product: 'ST880 PosiCharge Shorts',
            description: 'Sport-Tek Performance Shorts with team logo',
            quantity: 15,
            price: 22.99,
            styleNumber: 'ST880',
            customization: 'Embroidered logo on left leg'
          }
        ],
        defaultNotes: 'Team uniform package. Please provide roster with names and numbers.',
        tags: ['team', 'sports', 'uniform']
      }
    ];
    
    for (const templateData of sampleTemplates) {
      await this.createTemplate(templateData.name, templateData.lineItems, {
        description: templateData.description,
        defaultNotes: templateData.defaultNotes,
        tags: templateData.tags
      });
    }
  }
  
  /**
   * Get all available templates
   */
  async getTemplates(): Promise<QuoteTemplate[]> {
    if (!this.initialized) await this.initialize();
    return Array.from(this.templates.values());
  }
  
  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<QuoteTemplate | null> {
    if (!this.initialized) await this.initialize();
    return this.templates.get(id) || null;
  }
  
  /**
   * Get a template by name (case insensitive)
   */
  async getTemplateByName(name: string): Promise<QuoteTemplate | null> {
    if (!this.initialized) await this.initialize();
    
    const lowerName = name.toLowerCase();
    for (const template of this.templates.values()) {
      if (template.name.toLowerCase() === lowerName) {
        return template;
      }
    }
    
    return null;
  }
  
  /**
   * Search templates by name or tags
   */
  async searchTemplates(query: string): Promise<QuoteTemplate[]> {
    if (!this.initialized) await this.initialize();
    
    const results: QuoteTemplate[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const template of this.templates.values()) {
      if (template.name.toLowerCase().includes(lowerQuery)) {
        results.push(template);
        continue;
      }
      
      if (template.description?.toLowerCase().includes(lowerQuery)) {
        results.push(template);
        continue;
      }
      
      if (template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        results.push(template);
        continue;
      }
    }
    
    return results;
  }
  
  /**
   * Create a new template
   */
  async createTemplate(
    name: string, 
    lineItems: QuoteLineItem[], 
    options: {
      description?: string;
      defaultNotes?: string;
      tags?: string[];
      settings?: Record<string, any>;
    } = {}
  ): Promise<QuoteTemplate> {
    if (!this.initialized) await this.initialize();
    
    // Create a new template object
    const now = new Date().toISOString();
    const template: QuoteTemplate = {
      id: uuidv4(),
      name,
      description: options.description,
      createdAt: now,
      updatedAt: now,
      lineItems,
      defaultNotes: options.defaultNotes,
      tags: options.tags,
      settings: options.settings
    };
    
    // Save the template
    this.templates.set(template.id, template);
    await this.saveTemplate(template);
    
    return template;
  }
  
  /**
   * Update an existing template
   */
  async updateTemplate(
    id: string, 
    updates: Partial<Omit<QuoteTemplate, 'id' | 'createdAt'>>
  ): Promise<QuoteTemplate | null> {
    if (!this.initialized) await this.initialize();
    
    const template = this.templates.get(id);
    if (!template) return null;
    
    // Apply updates
    const updatedTemplate: QuoteTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated template
    this.templates.set(id, updatedTemplate);
    await this.saveTemplate(updatedTemplate);
    
    return updatedTemplate;
  }
  
  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    
    const template = this.templates.get(id);
    if (!template) return false;
    
    // Delete the template file
    const filePath = path.join(TEMPLATES_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from memory
    this.templates.delete(id);
    
    return true;
  }
  
  /**
   * Save a template to disk
   */
  private async saveTemplate(template: QuoteTemplate): Promise<void> {
    const filePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
    const templateData = JSON.stringify(template, null, 2);
    
    try {
      fs.writeFileSync(filePath, templateData, 'utf8');
    } catch (error) {
      logger.error(`Error saving template ${template.id}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const templateManager = new TemplateManager(); 