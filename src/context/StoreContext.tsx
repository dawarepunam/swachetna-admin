"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../types/product";
import { products as staticProducts } from "../data/products";

type CartLine = {
  productId: string;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  slug?: string;
  sku?: string;
  category?: string;
  gstRate?: number;
  hsnCode?: string;
};
type SavedStore = { cart?: unknown; wishlist?: unknown };
type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  ready: boolean;
  notice: string;
  cartCount: number;
  subtotal: number;
  allProducts: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  clearNotice: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);
const STORAGE_KEY = "swachetna-store-v1";

function readSavedStore(): { cart: CartLine[]; wishlist: string[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cart: [], wishlist: [] };
    const saved = JSON.parse(raw) as SavedStore;
    const cart = Array.isArray(saved.cart) ? saved.cart.filter((line): line is CartLine =>
      line && typeof line === "object" && typeof (line as CartLine).productId === "string" && typeof (line as CartLine).quantity === "number"
    ) : [];
    const wishlist = Array.isArray(saved.wishlist) ? saved.wishlist.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : [];
    return { cart, wishlist: [...new Set(wishlist)] };
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return { cart: [], wishlist: [] };
  }
}

export function StoreProvider({ children, allProducts }: { children: ReactNode; allProducts?: Product[] }) {
  const products = useMemo(() => {
    return allProducts && allProducts.length > 0 ? allProducts : staticProducts;
  }, [allProducts]);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  // Helper to match a product by id, slug or sku (ensures consistency across Strapi & Fallback IDs)
  const findProduct = useCallback((lookupId: string): Product | undefined => {
    if (!lookupId) return undefined;
    const lower = String(lookupId).toLowerCase().trim();
    const fromCurrent = products.find(
      (p) =>
        String(p.id).toLowerCase().trim() === lower ||
        (p.slug && p.slug.toLowerCase().trim() === lower) ||
        (p.sku && p.sku.toLowerCase().trim() === lower)
    );
    if (fromCurrent) return fromCurrent;

    // Fallback to static catalog if not in current list
    return staticProducts.find(
      (p) =>
        String(p.id).toLowerCase().trim() === lower ||
        (p.slug && p.slug.toLowerCase().trim() === lower) ||
        (p.sku && p.sku.toLowerCase().trim() === lower)
    );
  }, [products]);

  // Read saved store from localStorage on mount
  useEffect(() => {
    const saved = readSavedStore();
    setCart(saved.cart);
    setWishlist(saved.wishlist);
    setReady(true);
  }, []);

  // Persist cart and wishlist whenever changed
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist }));
    } catch {
      /* Keep shopping available when browser storage is unavailable. */
    }
  }, [cart, wishlist, ready]);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) { setCart([]); setWishlist([]); return; }
      try {
        const saved = JSON.parse(event.newValue) as SavedStore;
        const rawCart = Array.isArray(saved.cart) ? saved.cart.filter((line): line is CartLine =>
          line && typeof line === "object" && typeof (line as CartLine).productId === "string"
        ) : [];
        const rawWishlist = Array.isArray(saved.wishlist) ? saved.wishlist.filter((id): id is string => typeof id === "string") : [];
        setCart(rawCart);
        setWishlist([...new Set(rawWishlist)]);
      } catch { /* Ignore malformed data written by another tab. */ }
    };
    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  const addToCart = useCallback((product: Product, requestedQuantity = 1) => {
    if (product.stock < 1) { setNotice(`${product.name} is currently out of stock.`); return; }
    const quantity = Math.min(product.stock, Math.max(1, Math.floor(requestedQuantity)));
    const targetKey = product.id || product.slug;
    const price = typeof product.price === "number" && product.price > 0 ? product.price : 0;

    setCart((current) => {
      const foundIdx = current.findIndex(
        (line) => line.productId === targetKey || line.productId === product.id || line.productId === product.slug
      );
      if (foundIdx > -1) {
        const updated = [...current];
        const existing = updated[foundIdx];
        updated[foundIdx] = {
          ...existing,
          productId: targetKey,
          quantity: Math.min(product.stock, existing.quantity + quantity),
          price: price || existing.price || 0,
          name: product.name || existing.name,
          image: product.image || existing.image,
          slug: product.slug || existing.slug,
          sku: product.sku || existing.sku,
          category: product.category || existing.category,
          gstRate: product.gstRate !== undefined ? product.gstRate : existing.gstRate,
          hsnCode: product.hsnCode || existing.hsnCode,
        };
        return updated;
      }
      return [
        ...current,
        {
          productId: targetKey,
          quantity,
          price,
          name: product.name,
          image: product.image,
          slug: product.slug,
          sku: product.sku,
          category: product.category,
          gstRate: product.gstRate,
          hsnCode: product.hsnCode,
        },
      ];
    });
    setNotice(`${product.name} added to your shopping bag.`);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const product = findProduct(productId);
    const maxStock = product?.stock && product.stock > 0 ? product.stock : 99;
    const clamped = Math.min(maxStock, Math.max(1, Math.floor(quantity)));
    setCart((current) =>
      current.map((line) => {
        if (line.productId === productId || (product && (line.productId === product.id || line.productId === product.slug))) {
          return { ...line, quantity: clamped };
        }
        return line;
      })
    );
  }, [findProduct]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => {
      const target = findProduct(productId);
      return current.filter(
        (line) =>
          line.productId !== productId &&
          (!target || (line.productId !== target.id && line.productId !== target.slug))
      );
    });
  }, [findProduct]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    const product = findProduct(productId);
    const targetId = product ? (product.id || product.slug) : productId;
    const removing = wishlist.some(
      (id) => id === targetId || (product && (id === product.id || id === product.slug))
    );
    setWishlist((current) =>
      removing
        ? current.filter((id) => id !== targetId && (!product || (id !== product.id && id !== product.slug)))
        : [...current, targetId]
    );
    setNotice(
      removing
        ? `${product?.name ?? "Item"} removed from your wishlist.`
        : `${product?.name ?? "Item"} saved to your wishlist.`
    );
  }, [wishlist, findProduct]);

  const clearNotice = useCallback(() => setNotice(""), []);

  // Compute live subtotal and cartCount using flexible findProduct + fallback to cart line snapshot
  const validCartLines = useMemo(() => {
    return cart.map((line) => {
      const product = findProduct(line.productId);
      return {
        ...line,
        product,
      };
    });
  }, [cart, findProduct]);

  const cartCount = useMemo(() => {
    return validCartLines.reduce((total, line) => total + line.quantity, 0);
  }, [validCartLines]);

  const subtotal = useMemo(() => {
    return validCartLines.reduce((total, line) => {
      const price = (line.product && typeof line.product.price === "number")
        ? line.product.price
        : (typeof line.price === "number" ? line.price : 0);
      return total + price * line.quantity;
    }, 0);
  }, [validCartLines]);

  const value = useMemo<StoreValue>(() => ({
    cart, wishlist, ready, notice, allProducts: products,
    cartCount,
    subtotal, addToCart, setQuantity, removeFromCart, clearCart, toggleWishlist, clearNotice,
  }), [cart, wishlist, ready, notice, products, cartCount, subtotal, addToCart, setQuantity, removeFromCart, clearCart, toggleWishlist, clearNotice]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
