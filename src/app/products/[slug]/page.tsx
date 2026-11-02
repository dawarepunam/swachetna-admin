import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products as fallbackProducts } from "../../../data/products";
import { fetchStrapiAdminWorkspace } from "../../../lib/strapi";
import seededWorkspace from "../../../data/seededWorkspace.json";
import ProductDetail from "../../../components/products/ProductDetail/ProductDetail";
import type { Product } from "../../../types/product";

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const liveData = await fetchStrapiAdminWorkspace();
    const data = (liveData && Array.isArray(liveData.products) && liveData.products.length > 0) ? liveData : (seededWorkspace as any);
    if (data && Array.isArray(data.products)) {
      const match = data.products.find((p: any) => p.slug === slug);
      if (match) {
        if (match.status === "Draft") {
          return null;
        }
        return {
          id: match.id ? String(match.id) : match.slug,
          slug: match.slug,
          name: match.name,
          category: match.category || "Collections",
          price: Number(match.price) || 0,
          originalPrice: match.originalPrice ? Number(match.originalPrice) : undefined,
          badge: match.badge || undefined,
          shortDescription: match.description ? match.description.slice(0, 80) : "Handmade thoughtful find.",
          description: match.description || match.name || "",
          sku: match.sku || `SW-${match.slug}`,
          stock: Number(match.stock) || 0,
          featuredRank: 1,
          image: match.image || undefined,
          images: Array.isArray(match.images) ? match.images : (typeof match.images === "string" ? match.images.split(",").map((i: string) => i.trim()).filter(Boolean) : undefined),
          colors: typeof match.colors === "string" ? match.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : (Array.isArray(match.colors) ? match.colors : []),
          sizes: typeof match.sizes === "string" ? match.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(match.sizes) ? match.sizes : []),
          variants: Array.isArray(match.variants) ? match.variants : (typeof match.variants === 'string' ? (() => { try { return JSON.parse(match.variants); } catch { return []; } })() : []),
          reviews: Array.isArray(match.reviews) ? match.reviews : [],
        };
      }
    }
  } catch (err) {
    console.warn("Strapi product fetch failed, fallback:", err);
  }

  const fallback = fallbackProducts.find((item) => item.slug === slug);
  return fallback || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: product.name, description: product.shortDescription } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}

