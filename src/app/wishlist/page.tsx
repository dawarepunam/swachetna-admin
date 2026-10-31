"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import ProductGrid from "../../components/products/ProductGrid/ProductGrid";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const { wishlist, ready, allProducts } = useStore();

  // Match products by id, or by slug/sku/name fallback in case of Strapi id differences
  const saved = allProducts.filter((p) => {
    return wishlist.some((wId) => {
      const wLower = wId.toLowerCase();
      return (
        p.id.toLowerCase() === wLower ||
        (p.slug && p.slug.toLowerCase() === wLower) ||
        (p.sku && p.sku.toLowerCase() === wLower) ||
        (p.name && p.name.toLowerCase() === wLower)
      );
    });
  });

  return (
    <main className={styles.page}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#8a7e93", marginBottom: "16px" }}>
          <Link href="/" style={{ color: "#6a5375", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/account/profile" style={{ color: "#6a5375", textDecoration: "none" }}>My Account</Link>
          <span>/</span>
          <span style={{ color: "#3a2d42", fontWeight: "600" }}>Wishlist</span>
        </div>

        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>YOUR SAVED COLLECTION</span>
            <h1>
              Your <em>wishlist.</em>
            </h1>
          </div>
          <p className={styles.intro}>
            Curate pieces you love. Easily move them to your bag or buy directly from rural artisans.
          </p>
        </header>

        {!ready ? (
          <p className={styles.loading}>Loading your wishlist…</p>
        ) : saved.length > 0 ? (
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px solid #ebdfee"
            }}>
              <span style={{ fontSize: "13px", color: "#54465b", fontWeight: "600" }}>
                Showing <strong>{saved.length}</strong> saved {saved.length === 1 ? "item" : "items"}
              </span>
              <Link
                href="/shop"
                style={{
                  fontSize: "12px",
                  color: "#5d3570",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Continue browsing shop <ArrowRight size={13} />
              </Link>
            </div>

            <ProductGrid products={saved} />
          </div>
        ) : (
          <div className={styles.empty}>
            <Heart size={28} />
            <span className={styles.emptyLabel}>NO ITEMS SAVED YET</span>
            <h2>Your wishlist is empty.</h2>
            <p>Tap the heart icon on any product in our store to save handcrafted pieces here.</p>
            <Link href="/shop">
              Explore Collections <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
