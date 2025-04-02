import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * API endpoint for creating and managing customers through the chat interface
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a creation or lookup request
    if (body.action === 'check_exists') {
      // Lookup customer by email
      if (!body.email) {
        return NextResponse.json({
          success: false,
          error: 'Email is required for customer lookup'
        }, { status: 400 });
      }
      
      logger.info(`Checking if customer exists: ${body.email}`);
      
      // Check if customer exists
      const result = await AgentService.executeOperation('printavo_get_customer_by_email', { 
        email: body.email 
      });
      
      if (result.data) {
        // Customer exists
        return NextResponse.json({
          success: true,
          exists: true,
          customer: result.data,
          message: `Found existing customer: ${result.data.name}`
        });
      } else {
        // Customer does not exist
        return NextResponse.json({
          success: true,
          exists: false,
          message: `No customer found with email: ${body.email}`
        });
      }
    } else if (body.action === 'create') {
      // Create new customer
      if (!body.name || !body.email) {
        return NextResponse.json({
          success: false,
          error: 'Name and email are required for customer creation'
        }, { status: 400 });
      }
      
      logger.info(`Creating new customer: ${body.name} (${body.email})`);
      
      // Format address if provided
      let address = '';
      if (body.street) {
        address = body.street;
        if (body.city || body.state || body.zip) {
          address += '\n';
          
          if (body.city) {
            address += body.city;
            if (body.state) {
              address += `, ${body.state}`;
            }
            if (body.zip) {
              address += ` ${body.zip}`;
            }
          } else if (body.state) {
            address += body.state;
            if (body.zip) {
              address += ` ${body.zip}`;
            }
          } else if (body.zip) {
            address += body.zip;
          }
        }
      }
      
      // Create customer
      const result = await AgentService.executeOperation('printavo_create_customer', {
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        address: address || '',
        notes: body.notes || ''
      });
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to create customer'
        }, { status: 500 });
      }
      
      // Return success with customer data
      return NextResponse.json({
        success: true,
        customer: result.data,
        message: `Successfully created customer: ${body.name}`,
        richData: {
          type: 'customer',
          content: result.data
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Supported actions: check_exists, create'
      }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in customer API:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Unknown error'
    }, { status: 500 });
  }
} 