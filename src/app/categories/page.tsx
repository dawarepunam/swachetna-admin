"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProducts } from "../../context/ProductsContext";
import ProductArtwork from "../../components/products/ProductArtwork/ProductArtwork";
import styles from "./categories.module.css";

export default function CategoriesPage() {
  const { categories, products } = useProducts();
  return (
    <main className={styles.page}>
      <div className={`container ${styles.container}`}>
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>SOMETHING FOR EVERY DAY</span>
            <h1>Shop by <em>collection.</em></h1>
          </div>
          <p>Find thoughtful pieces for your home, meaningful moments, and everyday rituals.</p>
        </header>

        <div className={styles.grid}>
          {categories.map((category, index) => {
            const featuredProduct = products.find((product) => product.category === category.name) || {
              id: `cat-preview-${category.slug}`,
              slug: category.slug,
              name: category.name,
              category: category.name,
              price: 0,
              shortDescription: category.description || "Handcrafted collection",
              description: category.description || "",
              sku: `CAT-${category.slug}`,
              stock: 0,
              featuredRank: index + 1,
            };

            return (
              <Link key={category.slug} href={`/categories/${category.slug}`} className={styles.card}>
                <div className={styles.visual}>
                  <div className={styles.cardMeta}><span>0{index + 1}</span><span>{category.count || 0} {(category.count || 0) === 1 ? "ITEM" : "ITEMS"}</span></div>
                  <ProductArtwork product={featuredProduct} />
                </div>
                <div className={styles.copy}>
                  <div><h2>{category.name}</h2><p>{category.description}</p></div>
                  <span className={styles.arrow} aria-hidden="true"><ArrowRight /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
