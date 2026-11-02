"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Tag, CheckCircle2, X } from "lucide-react";
import { formatCurrency, products as staticCatalog } from "../../data/products";
import { useStore } from "../../context/StoreContext";
import ProductArtwork from "../../components/products/ProductArtwork/ProductArtwork";
import { useState, useEffect } from "react";
import styles from "./cart.module.css";

export default function CartPage() {
  const { cart, setQuantity, removeFromCart, clearCart, subtotal, ready, allProducts } = useStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Load active coupons from Strapi workspace
  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch("/api/admin/workspace", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.coupons;
          if (Array.isArray(list)) {
            setAvailableCoupons(list.filter((c: any) => c.status === "Active"));
            return;
          }
        }
      } catch {
        /* ignore */
      }
      // Fallback default
      setAvailableCoupons([
        { code: "SWACHETNA10", discountType: "percentage", discountValue: 10, minOrderAmount: 500, description: "10% off on orders above ₹500" }
      ]);
    }
    loadCoupons();

    // Check if previously applied in session
    try {
      const savedCpn = sessionStorage.getItem("swachetna-applied-coupon");
      if (savedCpn) setAppliedCoupon(JSON.parse(savedCpn));
    } catch { /* ignore */ }
  }, []);

  const handleApplyCoupon = (e?: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    setCouponError("");
    const targetCode = (codeToUse || couponCode).trim().toUpperCase();
    if (!targetCode) return;

    const found = availableCoupons.find((c) => c.code.toUpperCase() === targetCode);
    if (!found) {
      setCouponError("Invalid promo code. Please check and try again.");
      return;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      setCouponError(`This coupon requires a minimum cart value of ${formatCurrency(found.minOrderAmount)}.`);
      return;
    }

    let calculatedDiscount = 0;
    if (found.discountType === "percentage") {
      calculatedDiscount = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscount && calculatedDiscount > found.maxDiscount) {
        calculatedDiscount = found.maxDiscount;
      }
    } else {
      calculatedDiscount = found.discountValue;
    }

    const applied = {
      code: found.code,
      discount: calculatedDiscount,
      description: found.description,
    };

    setAppliedCoupon(applied);
    try {
      sessionStorage.setItem("swachetna-applied-coupon", JSON.stringify(applied));
    } catch { /* ignore */ }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    try {
      sessionStorage.removeItem("swachetna-applied-coupon");
    } catch { /* ignore */ }
  };

  const lines = cart
    .map((line) => {
      const lower = String(line.productId).toLowerCase().trim();
      const product =
        allProducts.find(
          (p) =>
            String(p.id).toLowerCase().trim() === lower ||
            (p.slug && p.slug.toLowerCase().trim() === lower) ||
            (p.sku && p.sku.toLowerCase().trim() === lower)
        ) ||
        staticCatalog.find(
          (p) =>
            String(p.id).toLowerCase().trim() === lower ||
            (p.slug && p.slug.toLowerCase().trim() === lower) ||
            (p.sku && p.sku.toLowerCase().trim() === lower)
        ) ||
        ({
          id: line.productId,
          slug: line.slug || line.productId,
          name: line.name || "Handcrafted Product",
          price: typeof line.price === "number" ? line.price : 0,
          category: line.category || "Collection",
          description: line.name || "",
          shortDescription: line.name || "",
          stock: 99,
          image: line.image,
          sku: line.sku,
        } as any);
      return { ...line, product };
    })
    .filter((line) => Boolean(line.product));
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
  const discountAmount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discount) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

  if (!ready) {
    return <main className={styles.page}><div className="container"><p>Loading your shopping bag…</p></div></main>;
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.crumb}>
          <Link href="/shop"><ArrowLeft size={15} /> Continue shopping</Link>
          <span>SHOPPING BAG</span>
        </div>

        <header className={styles.heading}>
          <span>YOUR BAG</span>
          <h1>{lines.length ? <>Little things,<br /><em>on their way.</em></> : <>A little something,<br /><em>for every day.</em></>}</h1>
        </header>

        {lines.length === 0 ? (
          <section className={styles.empty}>
            <span className={styles.emptyIcon}><ShoppingBag size={23} strokeWidth={1.6} /></span>
            <span className={styles.emptyLabel}>A FRESH START</span>
            <h2>Your bag is ready for something lovely.</h2>
            <p>Discover thoughtful finds for everyday living and meaningful gifting.</p>
            <Link href="/shop">Explore the collection <ArrowRight size={15} /></Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.lines} aria-label="Items in your shopping bag">
              <div className={styles.lineHead}>
                <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                <button type="button" onClick={clearCart}>Clear shopping bag</button>
              </div>

              {lines.map(({ product, quantity }) => product && (
                <article className={styles.line} key={product.id}>
                  <Link href={`/products/${product.slug}`} className={styles.art} aria-label={`View ${product.name}`}>
                    <ProductArtwork product={product} />
                  </Link>
                  <div className={styles.details}>
                    <span>{product.category}</span>
                    <Link href={`/products/${product.slug}`}><h2>{product.name}</h2></Link>
                    <p>{product.shortDescription}</p>
                    <div className={styles.controls}>
                      <div className={styles.quantity} aria-label={`Quantity: ${quantity}`}>
                        <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                        <span>{quantity}</span>
                        <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                      </div>
                      <button type="button" className={styles.remove} onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`}><Trash2 size={15} /><span>Remove</span></button>
                    </div>
                  </div>
                  <strong className={styles.linePrice}>{formatCurrency(product.price * quantity)}</strong>
                </article>
              ))}
            </section>

            <aside className={styles.summary}>
              <span className={styles.summaryLabel}>ORDER SUMMARY</span>
              <h2>A little summary.</h2>

              {/* Coupon / Promo Code Input Block */}
              <div style={{ margin: "16px 0", padding: "14px", background: "#fbf9fc", borderRadius: "12px", border: "1px dashed #cfbdd8" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#5d3570", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Tag size={14} /> HAVE A PROMO CODE?
                </span>

                {appliedCoupon ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", background: "#eef8f2", padding: "8px 12px", borderRadius: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "13px", color: "#1a8f4c", display: "block" }}>
                        <CheckCircle2 size={13} style={{ display: "inline", marginRight: "4px" }} />
                        {appliedCoupon.code} Applied
                      </strong>
                      <small style={{ color: "#2d6a4f", fontSize: "11px" }}>Saved {formatCurrency(discountAmount)}</small>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: "none", border: "none", color: "#a32a2a", cursor: "pointer", padding: "2px" }}
                      title="Remove promo code"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    <input
                      placeholder="e.g. SWACHETNA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: "7px", border: "1px solid #d4c8db", fontSize: "12px", textTransform: "uppercase", fontWeight: "600" }}
                    />
                    <button
                      type="submit"
                      style={{ background: "#5d3570", color: "#fff", border: "none", padding: "0 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && <p style={{ color: "#b91c1c", fontSize: "11px", margin: "6px 0 0" }}>{couponError}</p>}

                {/* Available Coupons Suggestions */}
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #ebdfee" }}>
                    <small style={{ color: "#7a6e83", fontSize: "10px", display: "block", marginBottom: "4px" }}>AVAILABLE PROMO CODES:</small>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(undefined, c.code)}
                          style={{
                            background: "#fff",
                            border: "1px solid #c9b4d3",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#5d3570",
                            cursor: "pointer"
                          }}
                        >
                          {c.code} ({c.discountType === "percentage" ? `${c.discountValue}% off` : `₹${c.discountValue} off`})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              {appliedCoupon && (
                <div style={{ color: "#1a8f4c" }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <strong>-{formatCurrency(discountAmount)}</strong>
                </div>
              )}
              <div><span>Estimated shipping</span><strong>{shipping ? formatCurrency(shipping) : "Free"}</strong></div>
              <small>{subtotal < 1500 ? `Free shipping estimate over ${formatCurrency(1500)}.` : "Free shipping estimate applied."}</small>
              <div className={styles.total}><span>Total</span><strong>{formatCurrency(finalTotal)}</strong></div>
              <Link className={styles.checkout} href="/checkout">Continue to checkout <ArrowRight size={17} /></Link>
              <p className={styles.notice}><ShieldCheck size={15} /> 100% Safe, Secure &amp; Handcrafted with care.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
