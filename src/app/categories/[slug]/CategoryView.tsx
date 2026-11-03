"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, Filter, PackageOpen, ChevronRight, Layers } from "lucide-react";
import ProductGrid from "../../../components/products/ProductGrid/ProductGrid";
import type { Product } from "../../../types/product";
import styles from "./category.module.css";

interface CategoryViewProps {
  categoryName: string;
  categoryDescription: string;
  categorySlug: string;
  subcategories: string[];
  items: (Product & { subcategory?: string })[];
}

export default function CategoryView({
  categoryName,
  categoryDescription,
  categorySlug,
  subcategories,
  items,
}: CategoryViewProps) {
  const searchParams = useSearchParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");

  useEffect(() => {
    const subParam = searchParams.get("sub");
    if (subParam) {
      const match = subcategories.find(
        (s) => s.trim().toLowerCase() === subParam.trim().toLowerCase()
      );
      if (match) {
        setSelectedSubcategory(match);
      } else {
        setSelectedSubcategory(subParam);
      }
    }
  }, [searchParams, subcategories]);

  // Compute item counts per subcategory
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: items.length };
    subcategories.forEach((sub) => {
      map[sub] = items.filter(
        (it) => it.subcategory?.trim().toLowerCase() === sub.trim().toLowerCase()
      ).length;
    });
    return map;
  }, [items, subcategories]);

  // If a specific subcategory is clicked, filter items
  const filteredItems = useMemo(() => {
    if (selectedSubcategory === "All") return items;
    return items.filter(
      (item) =>
        item.subcategory?.trim().toLowerCase() ===
        selectedSubcategory.trim().toLowerCase()
    );
  }, [items, selectedSubcategory]);

  // Group items by subcategory for the Amazon/Nykaa "Section by Section" view when "All" is active
  const groupedSections = useMemo(() => {
    if (selectedSubcategory !== "All") return [];
    
    const sections: { title: string; count: number; products: (Product & { subcategory?: string })[] }[] = [];
    
    subcategories.forEach((sub) => {
      const prods = items.filter(
        (it) => it.subcategory?.trim().toLowerCase() === sub.trim().toLowerCase()
      );
      if (prods.length > 0) {
        sections.push({ title: sub, count: prods.length, products: prods });
      }
    });

    // Uncategorized / General products in this category
    const others = items.filter((it) => {
      const sub = it.subcategory?.trim().toLowerCase();
      return !sub || !subcategories.some((s) => s.trim().toLowerCase() === sub);
    });

    if (others.length > 0) {
      sections.push({ title: "Featured Collection", count: others.length, products: others });
    }

    return sections;
  }, [items, subcategories, selectedSubcategory]);

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Amazon/Nykaa Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <ChevronRight size={13} className={styles.crumbSep} />
          <Link href="/categories">Collections</Link>
          <ChevronRight size={13} className={styles.crumbSep} />
          <span className={styles.crumbActive}>{categoryName}</span>
          {selectedSubcategory !== "All" && (
            <>
              <ChevronRight size={13} className={styles.crumbSep} />
              <span className={styles.crumbSubActive}>{selectedSubcategory}</span>
            </>
          )}
        </nav>

        {/* Category Header Banner */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>
            <Sparkles size={13} className={styles.sparkleIcon} />
            HANDCRAFTED HERITAGE COLLECTION
          </span>
          <h1>
            {categoryName}
            <em>.</em>
          </h1>
          <p className={styles.desc}>{categoryDescription}</p>
        </header>

        {/* Nykaa / Myntra Style Visual Sub-category Circles/Cards */}
        {subcategories.length > 0 && (
          <section className={styles.visualCirclesSection} aria-label="Sub-categories">
            <div className={styles.circlesHeader}>
              <span>EXPLORE BY SUB-CATEGORY</span>
              <small>Tap any department to filter instantly</small>
            </div>
            <div className={styles.circlesRow}>
              {/* "All" button circle */}
              <button
                type="button"
                className={`${styles.circleCard} ${selectedSubcategory === "All" ? styles.activeCircle : ""}`}
                onClick={() => setSelectedSubcategory("All")}
              >
                <div className={styles.circleAvatar}>
                  <Layers size={22} />
                </div>
                <strong className={styles.circleTitle}>All Items</strong>
                <span className={styles.circleCount}>{items.length} items</span>
              </button>

              {/* Sub-categories circles with photos */}
              {subcategories.map((sub, idx) => {
                const count = counts[sub] || 0;
                const sampleProd = items.find(
                  (it) => it.subcategory?.trim().toLowerCase() === sub.trim().toLowerCase() && it.image
                );
                return (
                  <button
                    key={sub}
                    type="button"
                    className={`${styles.circleCard} ${selectedSubcategory === sub ? styles.activeCircle : ""}`}
                    onClick={() => setSelectedSubcategory(sub)}
                  >
                    <div className={styles.circleAvatar}>
                      {sampleProd?.image ? (
                        <img
                          src={sampleProd.image}
                          alt={sub}
                          className={styles.circleImg}
                        />
                      ) : (
                        <div className={`${styles.circleFallback} ${styles[`avatarBg${idx % 4}`]}`}>
                          <span>{sub.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <strong className={styles.circleTitle}>{sub}</strong>
                    <span className={styles.circleCount}>{count} {count === 1 ? "item" : "items"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Filter Bar when a single subcategory is selected */}
        {selectedSubcategory !== "All" && (
          <div className={styles.filterBar}>
            <div className={styles.filterBarLeft}>
              <span>Showing:</span>
              <strong>{selectedSubcategory}</strong>
              <small>({filteredItems.length} {filteredItems.length === 1 ? "product" : "products"})</small>
            </div>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSelectedSubcategory("All")}
            >
              Show all sections ✕
            </button>
          </div>
        )}

        {/* VIEW MODE 1: Single Subcategory Filtered Grid */}
        {selectedSubcategory !== "All" && (
          filteredItems.length > 0 ? (
            <div className={styles.singleSectionGrid}>
              <ProductGrid products={filteredItems} showBuyNow={true} />
            </div>
          ) : (
            <div className={styles.emptyState}>
              <PackageOpen size={48} className={styles.emptyIcon} />
              <h3>No products found in &quot;{selectedSubcategory}&quot;</h3>
              <p>Fresh batches of artisan products are being prepared by self-help groups.</p>
              <button
                type="button"
                className={styles.viewAllBtn}
                onClick={() => setSelectedSubcategory("All")}
              >
                View all {categoryName}
              </button>
            </div>
          )
        )}

        {/* VIEW MODE 2: Amazon / Nykaa Section-by-Section Multi-Row Flow */}
        {selectedSubcategory === "All" && groupedSections.length > 0 && (
          <div className={styles.sectionsContainer}>
            {groupedSections.map((sec) => (
              <section key={sec.title} className={styles.sectionBlock}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleWrap}>
                    <h2>{sec.title}</h2>
                    <span className={styles.sectionBadge}>{sec.count} {sec.count === 1 ? "Product" : "Products"}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.viewSectionBtn}
                    onClick={() => setSelectedSubcategory(sec.title)}
                  >
                    View All {sec.title} <ChevronRight size={14} />
                  </button>
                </div>
                <ProductGrid products={sec.products} showBuyNow={true} />
              </section>
            ))}
          </div>
        )}

        {/* VIEW MODE 3: Fallback if no specific subcategory breakdown exists */}
        {selectedSubcategory === "All" && groupedSections.length === 0 && (
          <div className={styles.singleSectionGrid}>
            <ProductGrid products={items} showBuyNow={true} />
          </div>
        )}
      </div>
    </main>
  );
}
