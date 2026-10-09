'use server';

import { revalidatePath } from 'next/cache';
import { createProperty, deleteProperty } from '@/lib/properties';

export async function addPropertyAction(formData: FormData) {
  try {
    const title = String(formData.get('title') || '').trim();
    const location = String(formData.get('location') || '').trim();
    const priceStr = String(formData.get('price') || '0').trim();
    const price = parseFloat(priceStr) || 0;
    const property_type = String(formData.get('property_type') || 'Apartment');
    const listing_type = String(formData.get('listing_type') || 'For Rent');
    const bedrooms = parseInt(String(formData.get('bedrooms') || '1'), 10) || 1;
    const bathrooms = parseFloat(String(formData.get('bathrooms') || '1')) || 1;
    const area = parseFloat(String(formData.get('area') || '500')) || 500;
    const description = String(formData.get('description') || '').trim();
    const photoUrl = String(formData.get('photoUrl') || '').trim();

    if (!title || !location || price <= 0) {
      return { success: false, error: 'Please provide valid title, location, and price.' };
    }

    const defaultPhoto =
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
    const photos = [photoUrl || defaultPhoto];

    await createProperty({
      title,
      description,
      price,
      location,
      property_type,
      listing_type,
      bedrooms,
      bathrooms,
      area,
      photos,
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save property';
    return { success: false, error: message };
  }
}

export async function deletePropertyAction(propertyId: string) {
  try {
    if (!propertyId) {
      return { success: false, error: 'Missing property ID.' };
    }

    await deleteProperty(propertyId);
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete property';
    return { success: false, error: message };
  }
}
