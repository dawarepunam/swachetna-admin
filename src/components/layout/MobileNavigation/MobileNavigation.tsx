"use client";

import Link from "next/link";
import { useState } from "react";
import { X, ChevronDown, ChevronRight, Layers, Heart, ShoppingBag, UserRound, Search } from "lucide-react";
import { useProducts } from "../../../context/ProductsContext";
import styles from "./MobileNavigation.module.css";

export default function MobileNavigation({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { categories, products } = useProducts();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCat((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.navigation} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.menuLabel}>BROWSE STORE</span>
            <h2>Swachetna</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Quick Search Shortcut inside Drawer */}
        <div className={styles.drawerSearchBox}>
          <Link href="/search" onClick={onClose} className={styles.drawerSearchBtn}>
            <Search size={16} />
            <span>Search products & collections...</span>
          </Link>
        </div>

        <nav className={styles.links}>
          <Link href="/" onClick={onClose} className={styles.navMainLink}>
            <span>01</span> Home
          </Link>
          <Link href="/shop" onClick={onClose} className={styles.navMainLink}>
            <span>02</span> Shop All
          </Link>

          {/* Collapsible Mobile Collections with Subcategories */}
          <div className={styles.mobileCategorySection}>
            <div className={styles.mobileCatHeader}>
              <Link href="/categories" onClick={onClose} className={styles.navMainLink} style={{ margin: 0, padding: 0 }}>
                <span>03</span> Collections
              </Link>
            </div>

            <div className={styles.mobileCatList}>
              {categories.map((cat) => {
                const isExpanded = expandedCat === cat.slug;
                const subs = cat.subcategories || [];
                return (
                  <div key={cat.slug} className={styles.mobileCatItem}>
                    <div className={styles.mobileCatRow}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={onClose}
                        className={styles.mobileCatTitle}
                      >
                        {cat.name}
                      </Link>
                      {subs.length > 0 && (
                        <button
                          type="button"
                          className={styles.mobileExpandBtn}
                          onClick={() => toggleCategory(cat.slug)}
                          aria-label={`Toggle ${cat.name} subcategories`}
                        >
                          <ChevronDown
                            size={16}
                            style={{
                              transform: isExpanded ? "rotate(180deg)" : "none",
                              transition: "transform 0.2s",
                            }}
                          />
                        </button>
                      )}
                    </div>

                    {isExpanded && subs.length > 0 && (
                      <div className={styles.mobileSubList}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          onClick={onClose}
                          className={styles.mobileSubLinkAll}
                        >
                          • View all in {cat.name} ({cat.count || 0})
                        </Link>
                        {subs.map((sub) => {
                          const subCount = products.filter(
                            (p) =>
                              p.category === cat.name &&
                              (p as any).subcategory?.trim().toLowerCase() === sub.trim().toLowerCase()
                          ).length;
                          return (
                            <Link
                              key={sub}
                              href={`/categories/${cat.slug}`}
                              onClick={onClose}
                              className={styles.mobileSubLink}
                            >
                              <span>{sub}</span>
                              <small>{subCount}</small>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Link href="/about" onClick={onClose} className={styles.navMainLink}>
            <span>04</span> Our story
          </Link>
          <Link href="/contact" onClick={onClose} className={styles.navMainLink}>
            <span>05</span> Contact
          </Link>
          <Link href="/wishlist" onClick={onClose} className={styles.navMainLink}>
            <span>06</span> Wishlist
          </Link>
          <Link href="/account/profile" onClick={onClose} className={styles.navMainLink}>
            <span>07</span> My account
          </Link>
          <Link href="/cart" onClick={onClose} className={styles.navMainLink}>
            <span>08</span> Shopping bag
          </Link>
        </nav>

        <div className={styles.bottom}>
          <p>Handcrafted treasures empowering rural communities.</p>
        </div>
      </aside>
    </div>
  );
}
