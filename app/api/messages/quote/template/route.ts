import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * API endpoint for creating quotes from templates through the chat interface
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.templateId && !body.templateName) {
      return NextResponse.json({
        success: false,
        error: 'Either template ID or name is required'
      }, { status: 400 });
    }
    
    if (!body.customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      }, { status: 400 });
    }
    
    logger.info(`Creating quote from template: ${body.templateId || body.templateName}`);
    
    // First, get the template to display to the user
    let templateResult;
    if (body.templateId) {
      templateResult = await AgentService.executeOperation('printavo_get_quote_template', { id: body.templateId });
    } else {
      templateResult = await AgentService.executeOperation('printavo_get_quote_template', { name: body.templateName });
    }
    
    if (!templateResult.success) {
      return NextResponse.json({
        success: false,
        error: templateResult.error || `Template not found: ${body.templateId || body.templateName}`
      }, { status: 404 });
    }
    
    const template = templateResult.data;
    
    // If just getting template info, return it without creating the quote
    if (body.previewOnly) {
      return NextResponse.json({
        success: true,
        template,
        message: `Found template: ${template.name}`,
      });
    }
    
    // Create the quote from template
    const quoteResult = await AgentService.executeOperation('printavo_create_quote_from_template', {
      templateId: template.id,
      customerId: body.customerId,
      notes: body.notes,
      tag: body.tag
    });
    
    if (!quoteResult.success) {
      return NextResponse.json({
        success: false,
        error: quoteResult.error || 'Failed to create quote from template',
        message: `I'm having trouble creating a quote from the "${template.name}" template. ${quoteResult.error || 'Please try again.'}`
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: `Quote #${quoteResult.data.visualId} has been created from the "${template.name}" template.`,
      quote: quoteResult.data,
      template,
      richData: {
        type: 'quote',
        content: quoteResult.data
      }
    });
  } catch (error) {
    logger.error('Error in quote template API:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error',
      message: "I'm having trouble creating your quote from the template. Please try again."
    }, { status: 500 });
  }
} 