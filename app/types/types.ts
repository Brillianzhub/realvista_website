// ── Contact methods ───────────────────────────────────────────────────────────
export const CONTACT_METHODS = ["whatsapp", "phone", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

// ── Agent (aligned to API payload) ───────────────────────────────────────────
export interface Agent {
  id: number;
  user: string;
  first_name: string
  last_name: string
  user_id: number;                        // email address of the agent user
  avatar: string | null;
  agency_name?: string;
  agency_address?: string;
  phone_number?: string;
  whatsapp_number?: string;
  experience_years?: number;
  preferred_contact_mode?: ContactMethod;
  verified: boolean;
  featured: boolean;
  bio?: string;
  created_at: string;
  updated_at: string;
  properties: any[];
  ratings: any[];
  average_rating: number | null;
  total_views: number;
  total_inquiries: number;
  total_bookmarks: number;
  total_listings: number;
  top_performing_properties: any[];
}

// ── Form values (used by AgentFormModal on create/edit) ───────
export interface AgentFormValues {
  email: string;
  name: string;                          // last name / surname
  first_name: string;
  phone_number?: string;
  whatsapp_number?: string;
  agency_name?: string;
  agency_address?: string;
  experience_years?: number;
  preferred_contact_mode?: ContactMethod;
  bio?: string;
}



// ── Listing types ────────────────────────────────────────────────

export interface PropertyFeatures {
  negotiable: string;
  furnished: boolean;
  pet_friendly: boolean;
  parking_available: boolean;
  swimming_pool: boolean;
  garden: boolean;
  water_supply: boolean;
  security: boolean;
  electricity_proximity: string;
  road_network: string;
  development_level: string;
  additional_features: string;
}


export interface PropertyListing {
  id: number;
  agent_id: number;
  title: string;
  description: string;
  property_type: string;
  price: number;
  currency: string;
  listing_purpose: string;
  category?: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  availability: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  coordinate_url?: string;
  status: "draft" | "pending" | "published" | "rejected";
  images?: string[];
  created_at: string;
  updated_at?: string;
  listed_date: string
}

// ── Listing form values (used by ListingFormModal) ────────────
export interface ListingFormValues {
  title: string;
  description: string;
  property_type: string;
  price: string;
  currency: string;
  listing_purpose: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  availability: string;
  bedrooms: string;
  bathrooms: string;
  square_feet: string;
  lot_size: string;
  year_built: string;
  coordinate_url: string;
}

export const defaultListingFormValues: ListingFormValues = {
  title: "",
  description: "",
  property_type: "",
  price: "",
  currency: "NGN",
  listing_purpose: "sale",
  category: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  availability: "now",
  bedrooms: "",
  bathrooms: "",
  square_feet: "",
  lot_size: "",
  year_built: "",
  coordinate_url: "",
};
