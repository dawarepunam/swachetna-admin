import { notFound } from "next/navigation";
import { categories as fallbackCategories, products as fallbackProducts } from "../../../data/products";
import { fetchStrapiAdminWorkspace } from "../../../lib/strapi";
import CategoryView from "./CategoryView";
import type { Product } from "../../../types/product";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let categoryName = "";
  let categoryDescription = "";
  let subcategories: string[] = [];
  let items: (Product & { subcategory?: string })[] = [];

  try {
    const data = await fetchStrapiAdminWorkspace();
    if (data) {
      const catMatch = Array.isArray(data.categories)
        ? data.categories.find((c: any) => c.slug === slug)
        : null;

      if (catMatch) {
        categoryName = catMatch.name;
        categoryDescription = catMatch.description || "";
        
        // Parse subcategories from Strapi category definition
        if (catMatch.subcategories) {
          if (Array.isArray(catMatch.subcategories)) {
            subcategories = catMatch.subcategories;
          } else if (typeof catMatch.subcategories === "string") {
            subcategories = catMatch.subcategories
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
      }

      if (categoryName && Array.isArray(data.products)) {
        items = data.products
          .filter((p: any) => p.category?.toLowerCase() === categoryName.toLowerCase() && p.status !== "Draft")
          .map((p: any) => ({
            id: p.id ? String(p.id) : p.slug,
            slug: p.slug,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory || "",
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
            shortDescription: p.description ? p.description.slice(0, 80) : "Handcrafted piece.",
            description: p.description || p.name || "",
            sku: p.sku || `SW-${p.slug}`,
            stock: Number(p.stock) || 0,
            featuredRank: 1,
            image: p.image || undefined,
            colors: typeof p.colors === "string" ? p.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : (Array.isArray(p.colors) ? p.colors : []),
            sizes: typeof p.sizes === "string" ? p.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(p.sizes) ? p.sizes : []),
            reviews: Array.isArray(p.reviews) ? p.reviews : [],
          }));

        // If no subcategories defined on category, extract dynamic unique subcategories from products
        if (!subcategories.length) {
          const extracted = Array.from(
            new Set(
              items
                .map((it) => it.subcategory?.trim())
                .filter((sub): sub is string => Boolean(sub && sub.length > 0))
            )
          );
          if (extracted.length) {
            subcategories = extracted;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Strapi category fetch fallback:", err);
  }

  // Fallback if not found in Strapi
  if (!categoryName) {
    const fallbackCat = fallbackCategories.find((item) => item.slug === slug);
    if (!fallbackCat) notFound();
    categoryName = fallbackCat.name;
    categoryDescription = fallbackCat.description;
    subcategories = (fallbackCat as any).subcategories || [];
    items = fallbackProducts
      .filter((product) => product.category === fallbackCat.name)
      .map((p) => ({ ...p, subcategory: (p as any).subcategory || "" }));
  }

  return (
    <CategoryView
      categoryName={categoryName}
      categoryDescription={categoryDescription}
      categorySlug={slug}
      subcategories={subcategories}
      items={items}
    />
  );
}
