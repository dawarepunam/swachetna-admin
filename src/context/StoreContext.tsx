"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../types/product";
import { products as staticProducts } from "../data/products";

type CartLine = { productId: string; quantity: number };
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
  const products = allProducts && allProducts.length > 0 ? allProducts : staticProducts;
  const productIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = readSavedStore();
    setCart(saved.cart);
    setWishlist(saved.wishlist);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist })); } catch { /* Keep shopping available when browser storage is unavailable. */ }
  }, [cart, wishlist, ready]);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) { setCart([]); setWishlist([]); return; }
      try {
        const saved = JSON.parse(event.newValue) as SavedStore;
        const cart = Array.isArray(saved.cart) ? saved.cart.filter((line): line is CartLine =>
          line && typeof line === "object" && typeof (line as CartLine).productId === "string"
        ) : [];
        const wishlist = Array.isArray(saved.wishlist) ? saved.wishlist.filter((id): id is string => typeof id === "string") : [];
        setCart(cart);
        setWishlist([...new Set(wishlist)]);
      } catch { /* Ignore malformed data written by another tab. */ }
    };
    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  const addToCart = useCallback((product: Product, requestedQuantity = 1) => {
    if (product.stock < 1) { setNotice(`${product.name} is currently out of stock.`); return; }
    const quantity = Math.min(product.stock, Math.max(1, Math.floor(requestedQuantity)));
    setCart((current) => {
      const found = current.find((line) => line.productId === product.id);
      return found
        ? current.map((line) => line.productId === product.id ? { ...line, quantity: Math.min(product.stock, line.quantity + quantity) } : line)
        : [...current, { productId: product.id, quantity }];
    });
    setNotice(`${product.name} added to your shopping bag.`);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product) return;
    setCart((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(product.stock, Math.max(1, Math.floor(quantity))) } : line));
  }, [products]);

  const removeFromCart = useCallback((productId: string) => setCart((current) => current.filter((line) => line.productId !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    const removing = wishlist.includes(productId);
    const product = products.find((candidate) => candidate.id === productId);
    setWishlist((current) => removing ? current.filter((id) => id !== productId) : [...current, productId]);
    setNotice(removing ? `${product?.name ?? "Item"} removed from your wishlist.` : `${product?.name ?? "Item"} saved to your wishlist.`);
  }, [wishlist, products]);

  const clearNotice = useCallback(() => setNotice(""), []);

  const subtotal = useMemo(() =>
    cart.reduce((total, line) => total + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0),
    [cart, products]
  );

  const value = useMemo<StoreValue>(() => ({
    cart, wishlist, ready, notice, allProducts: products,
    cartCount: cart.reduce((total, line) => total + line.quantity, 0),
    subtotal, addToCart, setQuantity, removeFromCart, clearCart, toggleWishlist, clearNotice,
  }), [cart, wishlist, ready, notice, products, subtotal, addToCart, setQuantity, removeFromCart, clearCart, toggleWishlist, clearNotice]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
