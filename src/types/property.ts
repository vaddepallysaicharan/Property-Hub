export interface PropertyOwner {
  name: string;
  isVerified?: boolean;
}

export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Penthouse' | 'Condo';
export type ListingType = 'For Rent' | 'For Sale';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePeriod?: 'month' | 'total';
  location: {
    address: string;
    city: string;
    state: string;
    raw?: string;
  };
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: PropertyType;
  listingType: ListingType;
  imageUrl: string;
  photos?: string[];
  video_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isApproximateLocation?: boolean;
  isFeatured?: boolean;
  owner: PropertyOwner;
  tags?: string[];
}

export interface DbProperty {
  id: string;
  title: string;
  description: string | null;
  price: number;
  location: string;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  photos: string;
  video_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface PropertyFilters {
  location?: string;
  listingType?: ListingType | string;
  propertyType?: PropertyType | string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Enquiry {
  id: string;
  property_id: string;
  property_title?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface EnrichedEnquiry {
  id: string;
  property_id: string;
  property_title: string;
  property_price: number;
  property_listing_type: string;
  property_type: string;
  property_location: string;
  property_image: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}
