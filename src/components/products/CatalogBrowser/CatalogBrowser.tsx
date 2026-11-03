"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "../../../context/ProductsContext";
import ProductGrid from "../ProductGrid/ProductGrid";
import EmptyState from "../../ui/EmptyState/EmptyState";
import styles from "./CatalogBrowser.module.css";

export default function CatalogBrowser({ mode = "shop", initialQuery = "" }: { mode?: "shop" | "search"; initialQuery?: string }) {
  const searchParams = useSearchParams();
  const { products, categories } = useProducts();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(6);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Sync with URL query parameter ?q= if on search page or URL changes
  useEffect(() => {
    const urlQ = searchParams?.get("q");
    if (urlQ !== null && urlQ !== undefined) {
      setQuery(urlQ);
    } else if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setQuery(q);
    }
  }, [searchParams]);

  // Active category's available subcategories
  const activeCategoryObj = useMemo(() => {
    if (category === "All") return null;
    return categories.find((c) => c.name === category);
  }, [categories, category]);

  const activeSubcategories = useMemo(() => {
    if (!activeCategoryObj) return [];
    if (Array.isArray(activeCategoryObj.subcategories) && activeCategoryObj.subcategories.length > 0) {
      return activeCategoryObj.subcategories;
    }
    // Also extract from products in this category if any
    const fromProducts = Array.from(
      new Set(
        products
          .filter((p) => p.category === category)
          .map((p) => (p as any).subcategory?.trim())
          .filter(Boolean)
      )
    );
    return fromProducts as string[];
  }, [activeCategoryObj, products, category]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const colorsText = Array.isArray((product as any).colors) ? (product as any).colors.join(" ") : ((product as any).colors || "");
      const searchableText = `${product.name} ${product.category} ${(product as any).subcategory || ""} ${product.sku || ""} ${colorsText} ${product.shortDescription || ""} ${product.description || ""}`.toLowerCase();
      const matchQuery = searchableText.includes(term);
      const matchCat = category === "All" || product.category === category;
      const matchSub = subcategory === "All" || (product as any).subcategory?.trim().toLowerCase() === subcategory.trim().toLowerCase();
      const matchMin = !minimum || product.price >= Number(minimum);
      const matchMax = !maximum || product.price <= Number(maximum);
      return matchQuery && matchCat && matchSub && matchMin && matchMax;
    });
    return [...list].sort((a, b) => sort === "price-low"
      ? a.price - b.price
      : sort === "price-high"
        ? b.price - a.price
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : a.featuredRank - b.featuredRank);
  }, [query, category, subcategory, minimum, maximum, sort, products]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setSubcategory("All");
    setMinimum("");
    setMaximum("");
    setSort("featured");
    setLimit(6);
  };
  const setCategoryFilter = (value: string) => {
    setCategory(value);
    setSubcategory("All");
    setLimit(6);
  };
  const filters = <>
    <label className={styles.label}>
      <span>Search</span>
      <span className={styles.searchInput}>
        <input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(6); }} placeholder="Search products..." />
        <Search size={17} aria-hidden="true" />
      </span>
    </label>
    <fieldset>
      <legend>Collections</legend>
      <button type="button" className={`${styles.categoryBtn} ${category === "All" ? styles.selected : ""}`} aria-pressed={category === "All"} onClick={() => setCategoryFilter("All")}>
        <span className={styles.catName}>All Products</span>
        <span className={styles.catBadge}>{products.length}</span>
      </button>
      {categories.map((item) => (
        <div key={item.slug} className={styles.categoryGroup}>
          <button
            type="button"
            className={`${styles.categoryBtn} ${category === item.name ? styles.selected : ""}`}
            aria-pressed={category === item.name}
            onClick={() => setCategoryFilter(item.name)}
          >
            <span className={styles.catName}>{item.name}</span>
            <span className={styles.catBadge}>{item.count}</span>
          </button>
          {category === item.name && activeSubcategories.length > 0 && (
            <div className={styles.subcategorySublist}>
              <button
                type="button"
                className={`${styles.subcatItem} ${subcategory === "All" ? styles.activeSubcat : ""}`}
                onClick={() => { setSubcategory("All"); setLimit(6); }}
              >
                <span className={styles.subcatBullet}>•</span>
                <span className={styles.subcatTitle}>All in {item.name}</span>
              </button>
              {activeSubcategories.map((sub) => {
                const subCount = products.filter(
                  (p) => p.category === item.name && (p as any).subcategory?.trim().toLowerCase() === sub.trim().toLowerCase()
                ).length;
                return (
                  <button
                    key={sub}
                    type="button"
                    className={`${styles.subcatItem} ${subcategory === sub ? styles.activeSubcat : ""}`}
                    onClick={() => { setSubcategory(sub); setLimit(6); }}
                  >
                    <span className={styles.subcatBullet}>•</span>
                    <span className={styles.subcatTitle}>{sub}</span>
                    <span className={styles.subcatCountBadge}>{subCount}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </fieldset>
    <fieldset>
      <legend>Price range</legend>
      <div className={styles.prices}>
        <label>Minimum<input type="number" min="0" inputMode="numeric" value={minimum} onChange={(event) => { setMinimum(event.target.value); setLimit(6); }} placeholder="INR 0" /></label>
        <label>Maximum<input type="number" min="0" inputMode="numeric" value={maximum} onChange={(event) => { setMaximum(event.target.value); setLimit(6); }} placeholder="INR 5,000" /></label>
      </div>
    </fieldset>
  </>;

  const active = category !== "All" || Boolean(minimum || maximum || query);
  return <>
    <div className={styles.toolbar}>
      <div className={styles.resultCount} aria-live="polite"><span className={styles.count}>{filtered.length}</span> thoughtful {filtered.length === 1 ? "find" : "finds"}</div>
      <div className={styles.tools}>
        <button type="button" className={styles.mobileFilter} aria-expanded={mobileFilters} aria-controls="catalog-filters" onClick={() => setMobileFilters((open) => !open)}><SlidersHorizontal size={16} />{mobileFilters ? "Hide filters" : "Filters"}</button>
        <label>Sort by<select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(6); }}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>
      </div>
    </div>
    {active && <div className={styles.active} aria-label="Active filters"><span>Active filters</span>{category !== "All" && <button type="button" onClick={() => setCategoryFilter("All")}>{category}<X size={13} /></button>}{subcategory !== "All" && <button type="button" onClick={() => setSubcategory("All")}>Sub: {subcategory}<X size={13} /></button>}{query && <button type="button" onClick={() => { setQuery(""); setLimit(6); }}>“{query}”<X size={13} /></button>}{(minimum || maximum) && <button type="button" onClick={() => { setMinimum(""); setMaximum(""); setLimit(6); }}>Price<X size={13} /></button>}<button type="button" className={styles.clear} onClick={reset}>Clear all</button></div>}
    <div className={`${styles.layout} ${mobileFilters ? styles.filtersOpen : ""}`}>
      <aside id="catalog-filters" className={styles.sidebar} aria-label="Product filters">
        <div className={styles.sidebarHead}>Filter <button type="button" onClick={() => setMobileFilters(false)} aria-label="Close filters"><X size={17} /></button></div>
        {filters}
      </aside>
      <div className={styles.results} aria-busy="false">
        {filtered.length ? <>
          <ProductGrid products={filtered.slice(0, limit)} showBuyNow />
          {filtered.length > limit && <button type="button" className={styles.loadMore} onClick={() => setLimit((current) => Math.min(current + 4, filtered.length))}>View more products <span>({filtered.length - limit} remaining)</span></button>}
        </> : <EmptyState title="No products found" description="Try another search or change your filters." action={<button type="button" className={styles.reset} onClick={reset}>View all products</button>} />}
      </div>
    </div>
  </>;
}
