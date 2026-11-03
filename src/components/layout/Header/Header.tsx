"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, UserRound, ChevronDown, Sparkles, X, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useStore } from "../../../context/StoreContext";
import { useProducts } from "../../../context/ProductsContext";
import { formatCurrency } from "../../../data/products";
import MobileNavigation from "../MobileNavigation/MobileNavigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const u = localStorage.getItem("swachetna-demo-user");
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("swachetna-auth-changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("swachetna-auth-changed", syncUser);
    };
  }, []);

  // Live Instant Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  const { cartCount, wishlist, allProducts } = useStore();
  const { categories, products } = useProducts();

  const activeProducts = useMemo(() => {
    return allProducts && allProducts.length > 0 ? allProducts : products;
  }, [allProducts, products]);

  // Filter products live as user types
  const liveSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return activeProducts
      .filter((p) => {
        const text = `${p.name} ${p.category} ${(p as any).subcategory || ""} ${p.sku || ""}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 5);
  }, [searchQuery, activeProducts]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target) &&
          mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Valid wishlist count: only items that actually match available products
  const validWishlistCount = useMemo(() => {
    const list = allProducts && allProducts.length > 0 ? allProducts : products;
    if (!wishlist || wishlist.length === 0) return 0;
    return wishlist.filter((wId) => {
      const wLower = wId.toLowerCase();
      return list.some(
        (p) =>
          p.id.toLowerCase() === wLower ||
          (p.slug && p.slug.toLowerCase() === wLower) ||
          (p.sku && p.sku.toLowerCase() === wLower) ||
          (p.name && p.name.toLowerCase() === wLower)
      );
    }).length;
  }, [wishlist, allProducts, products]);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 48);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const handleMouseEnter = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const currentHoverCategory = categories[activeCategoryIndex] || categories[0];
  const currentSubcategories = currentHoverCategory?.subcategories || [];

  return (
    <>
      <header
        className={`${styles.header} ${isHomePage ? styles.overHero : styles.inFlow} ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="Swachetna Foundation home">
            <Image
              src="/images/swachetna-purple.webp"
              alt="Swachetna Foundation"
              width={320}
              height={120}
              priority
              className={styles.logoImage}
            />
          </Link>

          <nav className={styles.desktopNavigation} aria-label="Main navigation">
            <Link href="/shop">Shop</Link>

            {/* Mega Menu Parent Trigger */}
            <div
              className={styles.megaMenuTrigger}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/categories" className={styles.megaLink}>
                Collections <ChevronDown size={14} className={`${styles.chevron} ${megaMenuOpen ? styles.chevronOpen : ""}`} />
              </Link>

              {/* Amazon / Nykaa Style Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className={styles.megaDropdown} role="menu">
                  <div className={styles.megaDropdownInner}>
                    {/* Left Column: Category Tabs */}
                    <div className={styles.megaCategoriesCol}>
                      <span className={styles.megaColTitle}>ALL COLLECTIONS</span>
                      <ul className={styles.megaCatList}>
                        {categories.map((cat, idx) => {
                          const catProd = products.find(
                            (p) => p.category?.toLowerCase() === cat.name?.toLowerCase() && p.image
                          );
                          const iconImg = catProd?.image || (
                            cat.slug === "food-ngo"
                              ? "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg"
                              : cat.slug === "home-living"
                                ? "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg"
                                : cat.slug === "gifting"
                                  ? "/images/collections/gifting/festive-hampers/festive-hamper-main.jpg"
                                  : "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg"
                          );

                          return (
                            <li key={cat.slug}>
                              <Link
                                href={`/categories/${cat.slug}`}
                                className={`${styles.megaCatBtn} ${activeCategoryIndex === idx ? styles.activeMegaCat : ""}`}
                                onMouseEnter={() => setActiveCategoryIndex(idx)}
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                <span className={styles.catWithIcon}>
                                  <img
                                    src={iconImg}
                                    alt={cat.name}
                                    className={styles.megaCatThumb}
                                  />
                                  <span>{cat.name}</span>
                                </span>
                                <span className={styles.megaCatCount}>{cat.count || 0}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Middle Column: Sub-Categories Explore */}
                    <div className={styles.megaSubcategoriesCol}>
                      <div className={styles.megaSubHeader}>
                        <div>
                          <span className={styles.megaColTitle}>SUB-DEPARTMENTS</span>
                          <h3>{currentHoverCategory?.name}</h3>
                        </div>
                        <Link
                          href={`/categories/${currentHoverCategory?.slug}`}
                          className={styles.viewCategoryLink}
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          View All in {currentHoverCategory?.name} →
                        </Link>
                      </div>

                      {currentSubcategories.length > 0 ? (
                        <div className={styles.megaSubGrid}>
                          {currentSubcategories.map((sub) => {
                            const subProduct = products.find(
                              (p) =>
                                p.category === currentHoverCategory?.name &&
                                (p as any).subcategory?.trim().toLowerCase() === sub.trim().toLowerCase() &&
                                p.image
                            );
                            const count = products.filter(
                              (p) =>
                                p.category === currentHoverCategory?.name &&
                                (p as any).subcategory?.trim().toLowerCase() === sub.trim().toLowerCase()
                            ).length;
                            // Fallback image lookup based on subcategory name if no direct product image found
                            const getFallbackSubcategoryImage = (subName: string, catName: string) => {
                              const s = subName.toLowerCase();
                              if (s.includes("pickle")) return "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg";
                              if (s.includes("laddu") || s.includes("sweet")) return "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg";
                              if (s.includes("papad")) return "/images/collections/food-ngo/handmade-papads/urad-dal-papad-crisp.jpg";
                              if (s.includes("spice") || s.includes("masala")) return "/images/collections/food-ngo/spices-masala/goda-masala-roasted-spices.jpg";
                              if (s.includes("pottery") || s.includes("decor")) return "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg";
                              if (s.includes("dining") || s.includes("kitchen")) return "/images/collections/home-living/kitchen-dining/ceramic-serving-bowl.jpg";
                              if (s.includes("linen") || s.includes("table")) return "/images/collections/home-living/table-linen/lavender-linen-table-view.jpg";
                              if (s.includes("hamper")) return "/images/collections/gifting/festive-hampers/festive-hamper-main.jpg";
                              if (s.includes("gift") || s.includes("box")) return "/images/collections/gifting/thank-you-boxes/thank-you-box-closed.jpg";
                              if (s.includes("bag") || s.includes("tote")) return "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg";
                              if (s.includes("mug") || s.includes("morning")) return "/images/collections/collections/morning-rituals-mugs/stoneware-mug-front.jpg";
                              return currentHoverCategory?.image || "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg";
                            };

                            const subImg = subProduct?.image || getFallbackSubcategoryImage(sub, currentHoverCategory?.name || "");

                            return (
                              <Link
                                key={sub}
                                href={`/categories/${currentHoverCategory?.slug}?sub=${encodeURIComponent(sub)}`}
                                className={styles.megaSubItem}
                                onClick={() => setMegaMenuOpen(false)}
                              >
                                <img
                                  src={subImg}
                                  alt={sub}
                                  className={styles.megaSubThumb}
                                />
                                <div className={styles.megaSubInfo}>
                                  <strong>{sub}</strong>
                                  <small>{count} {count === 1 ? "product" : "products"}</small>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={styles.megaNoSubs}>
                          <p>{currentHoverCategory?.description}</p>
                          <Link
                            href={`/categories/${currentHoverCategory?.slug}`}
                            className={styles.exploreBtn}
                            onClick={() => setMegaMenuOpen(false)}
                          >
                            Explore {currentHoverCategory?.name} Products
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Mission Callout */}
                    <div className={styles.megaFeaturedCol}>
                      <span className={styles.megaFeaturedBadge}><Sparkles size={12} /> ARTISAN IMPACT</span>
                      <h4>Direct from Rural Self-Help Groups</h4>
                      <p>Every purchase directly provides livelihood and income to rural women artisans in Maharashtra.</p>
                      <Link
                        href="/categories"
                        className={styles.allCollectionsPill}
                        onClick={() => setMegaMenuOpen(false)}
                      >
                        Browse All Collections
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/about">Our story</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className={styles.actions}>
            {/* Amazon / Nykaa Style Live Search Bar */}
            <div className={`${styles.searchContainer} ${styles.mobileHidden}`} ref={searchRef}>
              <div className={styles.searchBarWrapper}>
                <Search size={16} className={styles.searchIconInside} />
                <input
                  type="text"
                  placeholder="Search handmade treasures..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setSearchOpen(true);
                  }}
                  className={styles.searchInputField}
                  aria-label="Search catalog"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Instant Search Dropdown */}
              {searchOpen && searchQuery.trim().length >= 2 && (
                <div className={styles.searchSuggestions}>
                  <div className={styles.suggestionHeader}>
                    Suggested Products ({liveSuggestions.length})
                  </div>
                  {liveSuggestions.length > 0 ? (
                    <>
                      <ul className={styles.suggestionList}>
                        {liveSuggestions.map((prod) => (
                          <li key={prod.id}>
                            <Link
                              href={`/products/${prod.slug}`}
                              className={styles.suggestionItem}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className={styles.suggestionThumb}
                                />
                              ) : (
                                <div className={styles.suggestionThumb} />
                              )}
                              <div className={styles.suggestionInfo}>
                                <span className={styles.suggestionName}>{prod.name}</span>
                                <span className={styles.suggestionCategory}>{prod.category}</span>
                              </div>
                              <span className={styles.suggestionPrice}>
                                {formatCurrency(prod.price)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className={styles.suggestionFooter}>
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          View all results for &ldquo;{searchQuery}&rdquo; <ArrowRight size={13} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className={styles.noMatches}>
                      No products matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              type="button"
              className={`${styles.actionButton} ${styles.mobileSearchToggle}`}
              onClick={() => setMobileSearchVisible((prev) => !prev)}
              aria-label={mobileSearchVisible ? "Close search bar" : "Open search bar"}
            >
              {mobileSearchVisible ? <X size={19} /> : <Search size={19} />}
            </button>

            <Link
              href={currentUser ? "/account/profile" : "/account/login"}
              className={`${styles.actionButton} ${styles.mobileHidden}`}
              aria-label={currentUser ? `Account of ${currentUser.name}` : "Account Login"}
              title={currentUser ? `Logged in as ${currentUser.name}` : "Sign in / Register"}
              style={{ position: "relative" }}
            >
              <UserRound size={19} />
              {currentUser && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#10b981",
                    border: "1.5px solid #fff"
                  }}
                />
              )}
            </Link>
            <Link
              href="/wishlist"
              className={styles.actionButton}
              aria-label={`Wishlist, ${validWishlistCount} items`}
            >
              <Heart size={19} />
              {validWishlistCount > 0 && <span className={styles.cartCount}>{validWishlistCount}</span>}
            </Link>
            <Link
              href="/cart"
              className={`${styles.actionButton} ${styles.cartButton}`}
              aria-label={`Shopping bag, ${cartCount} items`}
            >
              <ShoppingBag size={19} />
              <span className={styles.cartCount}>{cartCount}</span>
            </Link>
          </div>

          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Full-Width Interactive Search Bar */}
        {mobileSearchVisible && (
          <div className={styles.mobileSearchDropdown} ref={mobileSearchRef}>
            <div className={styles.mobileSearchBarWrapper}>
              <Search size={16} className={styles.mobileSearchIcon} />
              <input
                type="text"
                placeholder="Search pickles, laddus, handicrafts..."
                value={searchQuery}
                autoFocus
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                className={styles.mobileSearchInput}
                aria-label="Mobile Search"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  aria-label="Clear mobile search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Live Suggestions under Mobile Search */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className={styles.mobileSuggestionsList}>
                {liveSuggestions.length > 0 ? (
                  <>
                    <div className={styles.suggestionHeader}>
                      Suggested Products ({liveSuggestions.length})
                    </div>
                    {liveSuggestions.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.slug}`}
                        className={styles.suggestionItem}
                        onClick={() => {
                          setSearchOpen(false);
                          setMobileSearchVisible(false);
                          setSearchQuery("");
                        }}
                      >
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className={styles.suggestionThumb}
                          />
                        ) : (
                          <div className={styles.suggestionThumb} />
                        )}
                        <div className={styles.suggestionInfo}>
                          <span className={styles.suggestionName}>{prod.name}</span>
                          <span className={styles.suggestionCategory}>{prod.category}</span>
                        </div>
                        <span className={styles.suggestionPrice}>
                          {formatCurrency(prod.price)}
                        </span>
                      </Link>
                    ))}
                    <div className={styles.suggestionFooter}>
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setMobileSearchVisible(false);
                          setSearchQuery("");
                        }}
                      >
                        View all results for &ldquo;{searchQuery}&rdquo; <ArrowRight size={13} />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className={styles.noMatches}>
                    No products matching &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>
      <MobileNavigation isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
