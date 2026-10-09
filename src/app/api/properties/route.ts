import { NextRequest, NextResponse } from 'next/server';
import { createProperty } from '@/lib/properties';

export async function POST(request: NextRequest) {
  try {
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

    // 1. Title validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.title = 'Property title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Property title must be at least 5 characters.';
    }

    // 2. Description validation
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.description = 'Description is required.';
    } else if (description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters.';
    }

    // 3. Property Type validation
    const allowedPropertyTypes = ['Apartment', 'House', 'Villa'];
    if (!propertyType || !allowedPropertyTypes.includes(propertyType)) {
      errors.propertyType = 'Please select a valid property type (Apartment, House, or Villa).';
    }

    // 4. Listing Type validation
    const allowedListingTypes = ['For Sale', 'For Rent'];
    if (!listingType || !allowedListingTypes.includes(listingType)) {
      errors.listingType = 'Please select a valid listing type (For Sale or For Rent).';
    }

    // 5. Price validation
    const numPrice = Number(price);
    if (price === undefined || price === null || isNaN(numPrice) || numPrice < 0) {
      errors.price = 'Please enter a valid price.';
    } else if (numPrice <= 0) {
      errors.price = 'Price must be greater than 0.';
    }

    // 6. Location validation
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.location = 'Location is required.';
    }

    // 7. Bedrooms validation
    const numBedrooms = Number(bedrooms);
    if (bedrooms === undefined || bedrooms === null || isNaN(numBedrooms) || numBedrooms < 0) {
      errors.bedrooms = 'Bedrooms cannot be negative.';
    }

    // 8. Bathrooms validation
    const numBathrooms = Number(bathrooms);
    if (bathrooms === undefined || bathrooms === null || isNaN(numBathrooms) || numBathrooms <= 0) {
      errors.bathrooms = 'Please enter the number of bathrooms.';
    }

    // 9. Area validation
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

    // Call existing createProperty function
    const newPropertyId = await createProperty({
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      location: location.trim(),
      property_type: propertyType,
      listing_type: listingType,
      bedrooms: Math.floor(numBedrooms),
      bathrooms: Math.floor(numBathrooms),
      area: Math.floor(numArea),
      photos: [], // safely default to empty array
      video_url: null, // null until video generation
    });

    return NextResponse.json(
      {
        success: true,
        id: newPropertyId,
        message: 'Property created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API properties POST error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to create property. Please try again.',
      },
      { status: 500 }
    );
  }
}
