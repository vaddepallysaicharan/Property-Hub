import { NextRequest, NextResponse } from 'next/server';
import { checkPropertyExists, createEnquiry, getAllEnrichedEnquiries } from '@/lib/enquiries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || undefined;

    const enquiries = await getAllEnrichedEnquiries(propertyId);

    return NextResponse.json({
      success: true,
      enquiries,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API GET /api/enquiries error]:', errorMsg);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve enquiries.' },
      { status: 500 }
    );
  }
}

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Indian phone number regex: accepts optional country code (+91), 10 digits with optional spaces or dashes
const PHONE_REGEX = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

interface EnquiryRequestBody {
  propertyId?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    let body: EnquiryRequestBody = {};
    try {
      body = (await request.json()) as EnquiryRequestBody;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload.' },
        { status: 400 }
      );
    }

    const { propertyId, name, email, phone, message } = body || {};

    const fieldErrors: Record<string, string> = {};

    // 1. Validate propertyId
    if (!propertyId || typeof propertyId !== 'string' || !propertyId.trim()) {
      fieldErrors.propertyId = 'Property ID is required.';
    }

    // 2. Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      fieldErrors.name = 'Name is required and must be at least 2 characters.';
    }

    // 3. Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      fieldErrors.email = 'Please provide a valid email address.';
    }

    // 4. Validate phone
    const cleanPhone = typeof phone === 'string' ? phone.trim().replace(/[\s-]/g, '') : '';
    const isValidPhone =
      cleanPhone.length >= 10 &&
      (PHONE_REGEX.test(phone?.trim() || '') || /^\+?\d{10,13}$/.test(cleanPhone));
    if (!phone || typeof phone !== 'string' || !isValidPhone) {
      fieldErrors.phone = 'Please provide a valid 10-digit phone number.';
    }

    // 5. Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      fieldErrors.message = 'Message must be at least 10 characters.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed. Please check the provided information.',
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    // We know these fields are non-empty strings because validation succeeded
    const validPropertyId = propertyId!.trim();
    const validName = name!.trim();
    const validEmail = email!.trim();
    const validPhone = phone!.trim();
    const validMessage = message!.trim();

    // 6. Check if referenced property exists in database
    const propertyExists = await checkPropertyExists(validPropertyId);
    if (!propertyExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Property with ID "${validPropertyId}" does not exist.`,
        },
        { status: 404 }
      );
    }

    // 7. Insert enquiry into Turso database
    const id = await createEnquiry({
      propertyId: validPropertyId,
      name: validName,
      email: validEmail,
      phone: validPhone,
      message: validMessage,
    });

    return NextResponse.json(
      {
        success: true,
        enquiry: {
          id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API /api/enquiries error]:', errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process enquiry. Please try again later.',
      },
      { status: 500 }
    );
  }
}
