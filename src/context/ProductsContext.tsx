"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "../types/product";
import { products as fallbackProducts, categories as fallbackCategories, formatCurrency } from "../data/products";
import { fetchStrapiAdminWorkspace } from "../lib/strapi";

export interface CategoryItem {
  slug: string;
  name: string;
  description: string;
  image?: string;
  count?: number;
  subcategories?: string[];
}

export interface AdminContentData {
  title: string;
  description: string;
}

export interface AdminSettingsData {
  organization: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}

export interface AdminCampaignData {
  id: string;
  name: string;
  area: string;
  status: "Active" | "Draft";
}

interface ProductsContextValue {
  products: Product[];
  categories: CategoryItem[];
  campaigns: AdminCampaignData[];
  content: AdminContentData;
  settings: AdminSettingsData;
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const defaultContent: AdminContentData = {
  title: "Beautiful things, meaningful choices.",
  description: "Discover a thoughtfully curated collection created for everyday living, gifting and moments that matter.",
};

const defaultSettings: AdminSettingsData = {
  organization: "Swachetna Foundation",
  email: "hello@swachetna.org",
  phone: "",
  website: "https://swachetna.org",
  address: "Pune, Maharashtra, India",
};

const ProductsContext = createContext<ProductsContextValue>({
  products: fallbackProducts,
  categories: fallbackCategories,
  campaigns: [],
  content: defaultContent,
  settings: defaultSettings,
  loading: false,
  refreshProducts: async () => {},
});

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories);
  const [campaigns, setCampaigns] = useState<AdminCampaignData[]>([]);
  const [content, setContent] = useState<AdminContentData>(defaultContent);
  const [settings, setSettings] = useState<AdminSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/workspace", { cache: "no-store" });
      const json = await res.json();
      const data = json?.data;
      if (data) {
        // Products load करा (Strapi मधून)
        let formattedProducts: Product[] = fallbackProducts;
        if (Array.isArray(data.products) && data.products.length > 0) {
          const publishedProducts = data.products.filter((p: any) => p.status !== "Draft");
          formattedProducts = (publishedProducts.length > 0 ? publishedProducts : data.products).map((p: any, idx: number) => ({
            id: p.id ? String(p.id) : `p-${idx}`,
            slug: p.slug || `product-${idx}`,
            name: p.name || "Untitled Product",
            category: p.category || "Collections",
            subcategory: p.subcategory || undefined,
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            badge: p.badge || undefined,
            shortDescription: p.description ? p.description.slice(0, 80) : "Handmade thoughtful find.",
            description: p.description || p.name || "",
            sku: p.sku || `SW-${idx}`,
            stock: Number(p.stock) || 0,
            featuredRank: idx + 1,
            image: p.image || undefined,
            images: typeof p.images === "string" ? p.images.split(",").map((img: string) => img.trim()).filter(Boolean) : (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])),
            colors: typeof p.colors === "string" ? p.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : (Array.isArray(p.colors) ? p.colors : []),
            sizes: typeof p.sizes === "string" ? p.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(p.sizes) ? p.sizes : []),
            variants: Array.isArray(p.variants) ? p.variants : [],
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
          }));
          setProducts(formattedProducts);
        }

        // Categories स्वतंत्रपणे load करा — products असोत वा नसोत
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          const formattedCategories: CategoryItem[] = data.categories.map((c: any) => ({
            slug: c.slug,
            name: c.name,
            description: c.description || "",
            subcategories: typeof c.subcategories === "string"
              ? c.subcategories.split(",").map((s: string) => s.trim()).filter(Boolean)
              : (c.subcategories || []),
            image: `/images/categories/${c.slug === "home-living" ? "home" : c.slug === "gifting" ? "gifting" : "collection"}.svg`,
            count: formattedProducts.filter((p) => p.category === c.name).length,
          }));
          setCategories(formattedCategories);
        }

        if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns.map((c: any, idx: number) => ({
            id: c.id ? String(c.id) : `camp-${idx}`,
            name: c.name || "",
            area: c.area || "",
            status: c.status === "Draft" ? "Draft" : "Active",
          })));
        }

        if (data.content && data.content.title && data.content.title.trim() !== "Test") {
          setContent({
            title: data.content.title,
            description: data.content.description || defaultContent.description,
          });
        } else {
          setContent(defaultContent);
        }

        if (data.settings && data.settings.organization) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      }
    } catch (err) {
      console.warn("Using fallback products, Strapi not reachable:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, categories, campaigns, content, settings, loading, refreshProducts: loadProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
