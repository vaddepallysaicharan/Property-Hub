import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/properties';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required.' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();

    // 1. Verify property exists in Turso database
    const existing = await getPropertyById(trimmedId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      price,
      location,
      propertyType,
      listingType,
      bedrooms,
      bathrooms,
      area,
    } = body || {};

    const errors: Record<string, string> = {};

    // Title validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.title = 'Property title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Property title must be at least 5 characters.';
    }

    // Description validation
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.description = 'Description is required.';
    } else if (description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters.';
    }

    // Property Type validation
    const allowedPropertyTypes = ['Apartment', 'House', 'Villa'];
    if (!propertyType || !allowedPropertyTypes.includes(propertyType)) {
      errors.propertyType = 'Please select a valid property type (Apartment, House, or Villa).';
    }

    // Listing Type validation
    const allowedListingTypes = ['For Sale', 'For Rent'];
    if (!listingType || !allowedListingTypes.includes(listingType)) {
      errors.listingType = 'Please select a valid listing type (For Sale or For Rent).';
    }

    // Price validation (>= 0)
    const numPrice = Number(price);
    if (price === undefined || price === null || isNaN(numPrice) || numPrice < 0) {
      errors.price = 'Please enter a valid price.';
    }

    // Location validation
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.location = 'Location is required.';
    }

    // Bedrooms validation (>= 0)
    const numBedrooms = Number(bedrooms);
    if (bedrooms === undefined || bedrooms === null || isNaN(numBedrooms) || numBedrooms < 0) {
      errors.bedrooms = 'Bedrooms cannot be negative.';
    }

    // Bathrooms validation (> 0)
    const numBathrooms = Number(bathrooms);
    if (bathrooms === undefined || bathrooms === null || isNaN(numBathrooms) || numBathrooms <= 0) {
      errors.bathrooms = 'Please enter the number of bathrooms.';
    }

    // Area validation (> 0)
    const numArea = Number(area);
    if (area === undefined || area === null || isNaN(numArea) || numArea <= 0) {
      errors.area = 'Please enter the property area.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: Object.values(errors)[0],
          errors,
        },
        { status: 400 }
      );
    }

    // 3. Update property in Turso, preserving id, created_at, photos, and video_url
    const updated = await updateProperty(trimmedId, {
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      location: location.trim(),
      property_type: propertyType,
      listing_type: listingType,
      bedrooms: Math.floor(numBedrooms),
      bathrooms: Math.floor(numBathrooms),
      area: Math.floor(numArea),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Unable to update property. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API PUT /api/properties/[id] error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Unable to update property. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required.' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();

    // 1. Verify property exists in Turso database
    const existing = await getPropertyById(trimmedId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Property with ID "${trimmedId}" not found.` },
        { status: 404 }
      );
    }

    // 2. Perform deletion using existing data-access function
    const deleted = await deleteProperty(trimmedId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete property from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully.',
      id: trimmedId,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API DELETE /api/properties/[id] error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while deleting property.' },
      { status: 500 }
    );
  }
}
