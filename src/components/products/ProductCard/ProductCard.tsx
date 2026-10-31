"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, Heart, Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "../../../types/product";
import { formatCurrency } from "../../../data/products";
import { useStore } from "../../../context/StoreContext";
import ProductArtwork from "../ProductArtwork/ProductArtwork";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, showBuyNow = false }: { product: Product; showBuyNow?: boolean }) {
  const router = useRouter();
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);
  const saved = wishlist.includes(product.id);

  useEffect(() => () => {
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
  }, []);

  const handleAdd = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock < 1) return;
    addToCart(product);
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock < 1) return;
    addToCart(product);
    router.push("/checkout");
  };
  return (
    <article className={styles.card}>
      <div className={styles.visual}>
        <Link href={`/products/${product.slug}`} className={styles.artLink} aria-label={`${product.name} view`}><ProductArtwork product={product} /></Link>
        {product.stock < 1 && (
          <span style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "rgba(220, 38, 38, 0.92)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: "6px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            zIndex: 3,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}>
            Out of Stock
          </span>
        )}
        <button className={`${styles.wishlist} ${saved ? styles.saved : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
        {showBuyNow ? <div className={styles.cardActions}>
          <button type="button" className={`${styles.quickAdd} ${added ? styles.added : ""}`} onClick={handleAdd} disabled={product.stock < 1} aria-live="polite">
            {product.stock < 1 ? "Out of stock" : added ? <><Check size={16} /> Added</> : <><Plus size={15} /> Add to cart</>}
          </button>
          <button type="button" className={styles.buyNow} onClick={handleBuyNow} disabled={product.stock < 1}>
            {product.stock < 1 ? "Unavailable" : <>Buy now <ArrowRight size={14} /></>}
          </button>
        </div> : <button type="button" className={`${styles.quickAdd} ${added ? styles.added : ""}`} onClick={handleAdd} disabled={product.stock < 1} aria-live="polite">
          {product.stock < 1 ? "Out of stock" : added ? <><Check size={16} /> Added to cart</> : <><Plus size={15} /> Add to cart</>}
        </button>}
      </div>
      <div className={styles.info}>
        <div className={styles.meta}><span>{product.category}</span></div>
        <Link href={`/products/${product.slug}`} className={styles.name}>{product.name}<ArrowUpRight size={16} /></Link>
        <p className={styles.description}>{product.shortDescription}</p>
        <div className={styles.priceRow}><strong>{formatCurrency(product.price)}</strong>{product.originalPrice && <del>{formatCurrency(product.originalPrice)}</del>}</div>
      </div>
    </article>
  );
}
