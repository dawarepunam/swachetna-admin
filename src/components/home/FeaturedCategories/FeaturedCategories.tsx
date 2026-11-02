"use client";

import Link from "next/link";
import { ArrowUpRight, Gift, House, Shapes, Sparkles, UtensilsCrossed, Palette } from "lucide-react";
import { useProducts } from "../../../context/ProductsContext";
import styles from "./FeaturedCategories.module.css";

const categoryIconMap: Record<string, any> = {
  "food": UtensilsCrossed,
  "home": House,
  "living": House,
  "gift": Gift,
  "handmade": Palette,
  "collection": Shapes,
};

const categoryThemeClasses = [styles.foodTheme, styles.livingTheme, styles.giftingTheme, styles.handmadeTheme];

export default function FeaturedCategories() {
  const { categories } = useProducts();

  // Take top categories (up to 4 for clean, balanced responsive grid)
  const displayCategories = categories.slice(0, 4);

  return (
    <section className={styles.section} id="shop-by-mood">
      <div className="container">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={13} className={styles.sparkleIcon} />
              SHOP BY MOOD &amp; COLLECTION
            </span>
            <h2>A place for the things you love.</h2>
            <p className={styles.subheading}>
              Thoughtfully curated artisanal collections crafted with heart, purpose, and timeless Indian traditions.
            </p>
          </div>
          <Link href="/categories" className={styles.exploreLink}>
            Explore all collections <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className={styles.grid}>
          {displayCategories.map((category, index) => {
            const nameLower = category.name.toLowerCase();
            let IconComponent = Shapes;
            for (const key of Object.keys(categoryIconMap)) {
              if (nameLower.includes(key)) {
                IconComponent = categoryIconMap[key];
                break;
              }
            }

            const themeClass = categoryThemeClasses[index % categoryThemeClasses.length];

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={`${styles.card} ${themeClass}`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.number}>0{index + 1}</span>
                  <div className={styles.iconWrapper} aria-hidden="true">
                    <IconComponent size={24} strokeWidth={1.8} />
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <span className={styles.cardLabel}>CURATED COLLECTION</span>
                  <h3 className={styles.cardTitle}>{category.name}</h3>
                  <p className={styles.cardDescription}>{category.description}</p>
                </div>

                <div className={styles.cardBottom}>
                  <span className={styles.itemCount}>
                    <strong>{category.count || "Explore"}</strong> items crafted with love
                  </span>
                  <span className={styles.arrowCircle}>
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
