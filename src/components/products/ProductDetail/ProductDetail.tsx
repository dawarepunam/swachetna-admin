"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Star,
  Sparkles,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Share2,
  BadgeCheck,
  RotateCcw
} from "lucide-react";
import type { Product, ProductReview } from "../../../types/product";
import { formatCurrency, products, getProductGst } from "../../../data/products";
import { useStore } from "../../../context/StoreContext";
import ProductArtwork from "../ProductArtwork/ProductArtwork";
import ProductGrid from "../ProductGrid/ProductGrid";
import styles from "./ProductDetail.module.css";

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [view, setView] = useState(0);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  // Nykaa Shade Variants support: product.variants can have { name, hex, images: [] }
  const parsedVariants = useMemo(() => { if (!product.variants) return []; if (Array.isArray(product.variants)) return product.variants; if (typeof product.variants === 'string') { try { return JSON.parse(product.variants); } catch { return []; } } return []; }, [product.variants]);
  const hasVariants = parsedVariants.length > 0;
  
  // Compute context-appropriate variant labels based on product category & subcategory
  const variantLabels = useMemo(() => {
    const cat = (product.category || "").toLowerCase();
    const sub = (product.subcategory || "").toLowerCase();
    const prodName = (product.name || "").toLowerCase();

    // 1. Food / Pickles / Spices / Sweets
    if (cat.includes("food") || sub.includes("pickle") || sub.includes("sweet") || sub.includes("masala") || prodName.includes("pickle") || prodName.includes("laddu")) {
      return {
        primaryLabel: (sub.includes("pickle") || prodName.includes("pickle")) ? "Select Flavor / Variety" : "Select Type / Recipe",
        countSuffix: "Flavors / Varieties Available",
        secondaryLabel: "Select Weight / Package Size",
        isFood: true,
      };
    }

    // 2. Bags, Totes, Purses, Pouches
    if (sub.includes("bag") || prodName.includes("bag") || prodName.includes("tote") || prodName.includes("pouch")) {
      return {
        primaryLabel: "Select Color / Pattern",
        countSuffix: "Colors / Patterns Available",
        secondaryLabel: "Select Bag Size / Capacity",
        isFood: false,
      };
    }

    // 3. Linen, Fabrics, Textiles
    if (sub.includes("linen") || prodName.includes("linen") || prodName.includes("cotton") || prodName.includes("khadi")) {
      return {
        primaryLabel: "Select Color / Weave",
        countSuffix: "Colors Available",
        secondaryLabel: "Select Table Size / Dimensions",
        isFood: false,
      };
    }

    // 4. Pottery, Ceramics, Decor, Brass
    if (sub.includes("pottery") || sub.includes("decor") || prodName.includes("vase") || prodName.includes("ceramic") || prodName.includes("diya") || prodName.includes("bowl")) {
      return {
        primaryLabel: "Select Clay Finish / Material",
        countSuffix: "Finishes Available",
        secondaryLabel: "Select Dimensions / Height",
        isFood: false,
      };
    }

    // 5. Gifting & Hampers
    if (cat.includes("gift") || sub.includes("hamper") || prodName.includes("hamper") || prodName.includes("box")) {
      return {
        primaryLabel: "Select Hamper Edition / Theme",
        countSuffix: "Editions Available",
        secondaryLabel: "Select Box Option / Size",
        isFood: false,
      };
    }

    // Default
    return {
      primaryLabel: "Select Variant / Color",
      countSuffix: "Options Available",
      secondaryLabel: "Select Size / Quantity",
      isFood: false,
    };
  }, [product.category, product.subcategory, product.name]);

  // Available shades / colors / varieties
  const availableShades = useMemo(() => {
    if (hasVariants) {
      return product.variants!;
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.map((c) => ({
        name: c,
        hex: c.toLowerCase().includes("red") ? "#b84534"
          : c.toLowerCase().includes("pink") || c.toLowerCase().includes("blush") ? "#ea5d86"
          : c.toLowerCase().includes("coral") || c.toLowerCase().includes("orange") ? "#f97316"
          : c.toLowerCase().includes("black") ? "#262626"
          : c.toLowerCase().includes("blue") || c.toLowerCase().includes("indigo") ? "#295f98"
          : c.toLowerCase().includes("yellow") || c.toLowerCase().includes("ochre") ? "#d49a37"
          : c.toLowerCase().includes("green") ? "#2e7d32"
          : c.toLowerCase().includes("gold") || c.toLowerCase().includes("jute") ? "#c29958"
          : "#8b5e3c",
        images: product.images || (product.image ? [product.image] : [])
      }));
    }
    return [];
  }, [hasVariants, product.variants, product.colors, product.images, product.image]);

  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const activeShade = availableShades[selectedShadeIndex];

  // Multiple angle photos for currently selected shade
  const galleryImages = useMemo(() => {
    if (activeShade && Array.isArray(activeShade.images) && activeShade.images.length > 0) {
      return activeShade.images;
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return [];
  }, [activeShade, product.images, product.image]);

  // When shade changes, reset active image to 0
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedShadeIndex]);

  const activeMainImage = galleryImages[selectedImageIndex] || activeShade?.images?.[0] || product.image;

  // Variants: Sizes selection & Dynamic Price
  const availableSizes = useMemo(() => product.sizes || [], [product.sizes]);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "");

  // Dynamic price calculation based on selected weight/package size
  const activePrice = useMemo(() => {
    if (selectedSize && product.sizePrices && product.sizePrices[selectedSize] !== undefined) {
      return Number(product.sizePrices[selectedSize]);
    }
    return product.price;
  }, [selectedSize, product.sizePrices, product.price]);

  // Dynamic original price (MRP) calculation
  const activeOriginalPrice = useMemo(() => {
    if (selectedSize && product.sizePrices && product.sizePrices[selectedSize] !== undefined) {
      // Scale original price proportionally if defined
      if (product.originalPrice && product.price) {
        const ratio = product.originalPrice / product.price;
        return Math.round(Number(product.sizePrices[selectedSize]) * ratio);
      }
    }
    return product.originalPrice;
  }, [selectedSize, product.sizePrices, product.originalPrice, product.price]);

  // Reviews & Rating System
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(product.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart, wishlist, toggleWishlist, allProducts } = useStore();
  const productList = allProducts && allProducts.length > 0 ? allProducts : products;
  const related = productList
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);
  const saved = wishlist.includes(product.id);

  // Compute average rating
  const avgRating = useMemo(() => {
    if (!reviewsList.length) return 5.0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviewsList.length).toFixed(1);
  }, [reviewsList]);

  useEffect(() => () => {
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
  }, []);

  const handleAdd = () => {
    if (product.stock < 1) return;
    const productWithActivePrice = { ...product, price: activePrice, originalPrice: activeOriginalPrice };
    addToCart(productWithActivePrice, quantity, selectedSize, activeShade?.name);
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (product.stock < 1) return;
    const productWithActivePrice = { ...product, price: activePrice, originalPrice: activeOriginalPrice };
    addToCart(productWithActivePrice, quantity, selectedSize, activeShade?.name);
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);

    try {
      const res = await fetch("/api/products/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          author: authorName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.review) {
        setReviewsList((prev) => [data.review, ...prev]);
        setReviewSuccess(true);
        try {
          const storedRev = JSON.parse(localStorage.getItem("swachetna-user-submitted-reviews") || "[]");
          localStorage.setItem("swachetna-user-submitted-reviews", JSON.stringify([{ productSlug: product.slug, review: data.review }, ...storedRev]));
          window.dispatchEvent(new Event("swachetna-reviews-updated"));
        } catch { /* ignore */ }
        setAuthorName("");
        setReviewComment("");
        setReviewRating(5);
        setTimeout(() => {
          setReviewSuccess(false);
          setShowReviewForm(false);
        }, 2500);
      }
    } catch (err) {
      console.error("Failed to post review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Amazon-style Breadcrumbs */}
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} className={styles.crumbSep} />
          <Link href="/shop">Shop</Link>
          <ChevronRight size={13} className={styles.crumbSep} />
          <Link href={`/categories`}>{product.category}</Link>
          <ChevronRight size={13} className={styles.crumbSep} />
          <span aria-current="page" className={styles.crumbActive}>{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className={styles.layout}>
          {/* Left Gallery Section */}
          <section className={styles.gallery} aria-label="Product artwork">
            <div className={styles.galleryContainer}>
              {/* Nykaa Style Vertical/Side Thumbnail Selector for Angles */}
              {galleryImages.length > 1 && (
                <div className={styles.angleThumbnailsList}>
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.angleThumbBtn} ${selectedImageIndex === idx ? styles.activeAngleThumb : ""}`}
                      onClick={() => setSelectedImageIndex(idx)}
                      onMouseEnter={() => setSelectedImageIndex(idx)}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <img src={imgUrl} alt={`${product.name} angle ${idx + 1}`} className={styles.angleThumbImg} />
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.mainArtWrapper}>
                {activeMainImage ? (
                  <div className={styles.realProductPhoto}>
                    <img src={activeMainImage} alt={product.name} className={styles.productPhotoImg} />
                  </div>
                ) : (
                  <div className={`${styles.mainArt} ${view === 1 ? styles.viewDetail : view === 2 ? styles.viewStyled : ""}`}>
                    <ProductArtwork product={product} large />
                  </div>
                )}
                {product.badge && <span className={styles.badgeOverImage}>{product.badge}</span>}
              </div>
            </div>

            <small className={styles.artHint}>✨ 100% Handcrafted by Rural Self-Help Groups</small>
          </section>

          {/* Right Product Details Section */}
          <section className={styles.details} aria-labelledby="product-title">
            <div className={styles.categoryBadgeRow}>
              <span className={styles.categoryTag}>{product.category}</span>
              {product.subcategory && <span className={styles.subcatTag}>• {product.subcategory}</span>}
            </div>

            <h1 id="product-title" className={styles.productTitle}>{product.name}</h1>

            {/* Rating Stars & Review Summary */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(Number(avgRating)) ? "#f59e0b" : "#e5e7eb"}
                    color={s <= Math.round(Number(avgRating)) ? "#f59e0b" : "#d1d5db"}
                  />
                ))}
              </div>
              <strong className={styles.ratingScore}>{avgRating}</strong>
              <span className={styles.reviewCount}>({reviewsList.length} verified {reviewsList.length === 1 ? "review" : "reviews"})</span>
              <a href="#reviews-section" className={styles.seeAllReviews}>Read reviews ↓</a>
            </div>

            {/* Price Block */}
            <div className={styles.priceBlock}>
              <div className={styles.priceRow}>
                <strong className={styles.finalPrice}>{formatCurrency(activePrice)}</strong>
                {activeOriginalPrice && activeOriginalPrice > activePrice && (
                  <>
                    <del className={styles.origPrice}>{formatCurrency(activeOriginalPrice)}</del>
                    <span className={styles.discountBadge}>
                      {Math.round(((activeOriginalPrice - activePrice) / activeOriginalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              {(() => {
                const taxInfo = getProductGst(product);
                const gstAmount = Math.round((activePrice * taxInfo.rate) / (100 + taxInfo.rate));
                return (
                  <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <small className={styles.taxInclusive} style={{ margin: 0 }}>
                      Inclusive of all taxes ({taxInfo.rate}% GST: ₹{gstAmount})
                    </small>
                    {taxInfo.hsn && (
                      <span style={{ fontSize: "11px", background: "#f3eef7", color: "#6b4984", padding: "1px 6px", borderRadius: "4px", fontWeight: 600 }}>
                        HSN: {taxInfo.hsn}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            <p className={styles.desc}>{product.description || product.shortDescription}</p>

            {/* E-COMMERCE SUB-TYPE VARIANT SELECTOR */}
            {availableShades.length > 0 && (
              <div className={styles.variantGroup} style={{ marginTop: "20px", background: "#faf8fc", padding: "16px", borderRadius: "12px", border: "1px solid #ebdff4" }}>
                <div className={styles.variantLabelRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#614e76", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {variantLabels.primaryLabel}:
                    </span>
                    <strong style={{ fontSize: "15px", color: "#7451ba", fontWeight: 800 }}>{activeShade?.name}</strong>
                  </div>
                  <span style={{ fontSize: "11px", color: "#8a75a0", fontWeight: 600 }}>
                    {availableShades.length} {variantLabels.countSuffix}
                  </span>
                </div>

                {/* Sub-type Selection Cards / Chips */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                  {availableShades.map((shade, idx) => {
                    const isSelected = selectedShadeIndex === idx;
                    const previewThumb = shade.images?.[0] || activeMainImage;
                    return (
                      <button
                        key={shade.name}
                        type="button"
                        onClick={() => setSelectedShadeIndex(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "10px",
                          border: isSelected ? "2px solid #7451ba" : "1.5px solid #ded5e9",
                          background: isSelected ? "#ffffff" : "#fdfbfe",
                          boxShadow: isSelected ? "0 4px 12px rgba(116,81,186,0.18)" : "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {previewThumb ? (
                          <img
                            src={previewThumb}
                            alt={shade.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              objectFit: "cover",
                              border: isSelected ? "1.5px solid #7451ba" : "1px solid #eee",
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: shade.hex || "#7451ba", flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <span style={{
                            fontSize: "12px",
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? "#392353" : "#5d4b72",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {shade.name}
                          </span>
                          <small style={{ fontSize: "10px", color: isSelected ? "#7451ba" : "#998ba8", display: "block", fontWeight: 500 }}>
                            {isSelected ? "Active sub-type" : "View photos"}
                          </small>
                        </div>
                        {isSelected && <Check size={15} color="#7451ba" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECONDARY VARIANT: Multiple Sizes / Package Weights */}
            {availableSizes.length > 0 && (
              <div className={styles.variantGroup}>
                <div className={styles.variantLabelRow}>
                  <span>{variantLabels.secondaryLabel}:</span>
                  <strong>{selectedSize}</strong>
                </div>
                <div className={styles.sizePills}>
                  {availableSizes.map((sz) => {
                    const szPrice = product.sizePrices && product.sizePrices[sz] !== undefined ? product.sizePrices[sz] : null;
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`${styles.sizeBtn} ${selectedSize === sz ? styles.selectedSizeBtn : ""}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        <span>{sz}</span>
                        {szPrice !== null && (
                          <strong style={{ marginLeft: "6px", fontSize: "11px", opacity: 0.9 }}>
                            {formatCurrency(szPrice)}
                          </strong>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Availability */}
            <p className={`${styles.stock} ${product.stock < 1 ? styles.outOfStock : ""}`}>
              <span aria-hidden="true" className={styles.stockDot} />
              {product.stock > 0 ? `In Stock · Ready to dispatch (${product.stock} units)` : "Currently Sold Out"}
            </p>

            {/* Quantity & CTA Buttons */}
            <div className={styles.purchase}>
              <div className={styles.purchaseControls}>
                <div className={styles.quantityPicker} aria-label="Choose quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((c) => Math.max(1, c - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <output aria-live="polite">{quantity}</output>
                  <button
                    type="button"
                    onClick={() => setQuantity((c) => Math.min(product.stock, c + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.wishlistBtn} ${saved ? styles.saved : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                >
                  <Heart size={18} fill={saved ? "currentColor" : "none"} />
                  <span>{saved ? "Wishlisted" : "Wishlist"}</span>
                </button>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={`${styles.addBtn} ${added ? styles.added : ""}`}
                  disabled={product.stock < 1}
                  onClick={handleAdd}
                >
                  {product.stock < 1 ? "Out of stock" : added ? <>Added to Bag <Check size={18} /></> : <>Add to Bag <ArrowRight size={18} /></>}
                </button>
                <button
                  type="button"
                  className={styles.buyNowBtn}
                  disabled={product.stock < 1}
                  onClick={handleBuyNow}
                >
                  {product.stock < 1 ? "Out of stock" : <>Instant Buy Now ⚡</>}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <Truck size={18} className={styles.trustIcon} />
                <div>
                  <strong>Free Fast Shipping</strong>
                  <small>On all prepaid orders over ₹1,500</small>
                </div>
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} className={styles.trustIcon} />
                <div>
                  <strong>Safe &amp; Encrypted Payment</strong>
                  <small>Razorpay UPI, Cards &amp; NetBanking</small>
                </div>
              </div>
              <div className={styles.trustItem}>
                <Sparkles size={18} className={styles.trustIcon} />
                <div>
                  <strong>Direct Rural Artisan Support</strong>
                  <small>100% handcrafted in Maharashtra</small>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* REVIEWS & RATINGS SECTION (Amazon / Flipkart Style) */}
        <section id="reviews-section" className={styles.reviewsSection}>
          <div className={styles.reviewsHead}>
            <div>
              <span className={styles.reviewsEyebrow}>COMMUNITY VOICES</span>
              <h2>Customer Ratings &amp; Reviews</h2>
              <p>Authentic feedback from supporters of Swachetna Foundation products.</p>
            </div>
            <button
              type="button"
              className={styles.writeReviewBtn}
              onClick={() => setShowReviewForm((v) => !v)}
            >
              <MessageSquare size={16} /> {showReviewForm ? "Close Form" : "Write a Review"}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <h3>Share your experience with this item</h3>
              
              <div className={styles.formRow}>
                <label>
                  Your Name
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kulkarni"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </label>
                <label>
                  Your Rating
                  <div className={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setReviewRating(st)}
                        className={styles.starBtn}
                      >
                        <Star
                          size={22}
                          fill={st <= reviewRating ? "#f59e0b" : "#e5e7eb"}
                          color={st <= reviewRating ? "#f59e0b" : "#d1d5db"}
                        />
                      </button>
                    ))}
                    <span className={styles.ratingPill}>{reviewRating} of 5 Stars</span>
                  </div>
                </label>
              </div>

              <label>
                Your Review &amp; Comments
                <textarea
                  rows={4}
                  required
                  placeholder="Tell others about the quality, texture, packaging, or taste of this handcrafted piece..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </label>

              {reviewSuccess && (
                <div className={styles.reviewSuccessMsg}>
                  <Check size={16} /> Thank you! Your review was successfully published.
                </div>
              )}

              <button
                type="submit"
                className={styles.submitReviewBtn}
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"} <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className={styles.reviewsGrid}>
            {reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <article key={rev.id} className={styles.reviewCard}>
                  <div className={styles.reviewTop}>
                    <div className={styles.authorMeta}>
                      <span className={styles.authorAvatar}>{rev.author.charAt(0)}</span>
                      <div>
                        <strong>{rev.author}</strong>
                        {rev.verified && (
                          <span className={styles.verifiedBuyer}>
                            <BadgeCheck size={13} /> Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.reviewDate}>{rev.date}</span>
                  </div>

                  <div className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= rev.rating ? "#f59e0b" : "#e5e7eb"}
                        color={s <= rev.rating ? "#f59e0b" : "#d1d5db"}
                      />
                    ))}
                  </div>

                  <p className={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</p>
                </article>
              ))
            ) : (
              <div className={styles.noReviews}>
                <p>No customer reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Products Carousel */}
        {related.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeading}>
              <span>RECOMMENDED PAIRINGS</span>
              <h2>More from {product.category}</h2>
            </div>
            <ProductGrid products={related} showBuyNow={true} />
          </section>
        )}
      </div>
    </main>
  );
}
