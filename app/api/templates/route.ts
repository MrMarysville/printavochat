import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * API endpoint for managing quote templates
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParam = request.nextUrl.searchParams.get('q');
    const idParam = request.nextUrl.searchParams.get('id');
    const nameParam = request.nextUrl.searchParams.get('name');
    
    // Log the request
    logger.info(`Template API request: ${searchParam ? `search=${searchParam}` : idParam ? `id=${idParam}` : nameParam ? `name=${nameParam}` : 'list all'}`);
    
    if (idParam) {
      // Get template by ID
      const result = await AgentService.executeOperation('printavo_get_quote_template', { id: idParam });
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || `Template with ID ${idParam} not found`
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        template: result.data
      });
    } else if (nameParam) {
      // Get template by name
      const result = await AgentService.executeOperation('printavo_get_quote_template', { name: nameParam });
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || `Template with name ${nameParam} not found`
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        template: result.data
      });
    } else if (searchParam) {
      // Search templates
      const result = await AgentService.executeOperation('printavo_search_quote_templates', { query: searchParam });
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Error searching templates'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        templates: result.data
      });
    } else {
      // List all templates
      const result = await AgentService.executeOperation('printavo_list_quote_templates', {});
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Error listing templates'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        templates: result.data
      });
    }
  } catch (error) {
    logger.error('Error in templates API:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Create a new template or update an existing one
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is an update or create
    if (body.id) {
      // Update existing template
      const result = await AgentService.executeOperation('printavo_update_quote_template', body);
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Error updating template'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        template: result.data,
        message: 'Template updated successfully'
      });
    } else {
      // Create new template
      // Validate required fields
      if (!body.name || !body.lineItems) {
        return NextResponse.json({
          success: false,
          error: 'Template name and line items are required'
        }, { status: 400 });
      }
      
      const result = await AgentService.executeOperation('printavo_create_quote_template', body);
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Error creating template'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        template: result.data,
        message: 'Template created successfully'
      });
    }
  } catch (error) {
    logger.error('Error in templates API:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Delete a template
 */
export async function DELETE(request: NextRequest) {
  try {
    const idParam = request.nextUrl.searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json({
        success: false,
        error: 'Template ID is required'
      }, { status: 400 });
    }
    
    const result = await AgentService.executeOperation('printavo_delete_quote_template', { id: idParam });
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || `Failed to delete template ${idParam}`
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      id: idParam
    });
  } catch (error) {
    logger.error('Error in templates API:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error'
    }, { status: 500 });
  }
} 