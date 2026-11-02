export type ProductBadge = "New" | "Bestseller" | "Sale" | "Popular";

export interface ProductReview {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified?: boolean;
}

export interface ProductVariant {
  name: string; // e.g. "Happy", "Joy", "Terracotta Red"
  hex?: string; // color code e.g. "#e87382"
  images: string[]; // specific multiple angle photos for this shade/color
  price?: number;
  originalPrice?: number;
  stock?: number;
  size?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  badge?: ProductBadge;
  shortDescription: string;
  description: string;
  sku: string;
  stock: number;
  featuredRank: number;
  image?: string;
  images?: string[]; // Multiple angle views / gallery photos (Front, Close-up, Angle, In-use)
  colors?: string[]; // Multiple available colors e.g. ["Terracotta Red", "Natural Ochre", "Midnight Black"]
  sizes?: string[]; // Multiple sizes/weights e.g. ["250g", "500g", "1kg"] or ["Small", "Standard"]
  variants?: ProductVariant[]; // Nykaa-style shade variants each with its own photos
  reviews?: ProductReview[];
  gstRate?: number; // GST percentage e.g. 0, 5, 12, 18
  hsnCode?: string; // HSN Code e.g. "6305", "2106", "6912"
}
