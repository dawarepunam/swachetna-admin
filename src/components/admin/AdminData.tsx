"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { categories as baseCategories, products as baseProducts } from "../../data/products";
import type { ProductReview } from "../../types/product";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  status: "Published" | "Draft";
  image?: string;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  variants?: Array<{
    name: string;
    hex?: string;
    images: string[];
    price?: number;
    stock?: number;
    sizePrices?: Record<string, number>;
  }>;
  reviews?: ProductReview[];
  gstRate?: number;
  hsnCode?: string;
  sizePrices?: Record<string, number>;
};
export type AdminCategory = {
  slug: string;
  name: string;
  description: string;
  subcategories?: string[] | string;
  gstRate?: number;
  hsnCode?: string;
};
export type OrderItem = { id?: string; name: string; price: number; quantity: number; image?: string; sku?: string };
export type AdminOrder = {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: OrderItem[];
  total: number;
  createdAt: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  paymentMethod?: string;
};
export type AdminCampaign = { id: string; name: string; area: string; status: "Active" | "Draft" };
export type AdminContent = { title: string; description: string };
export type AdminSettings = { organization: string; email: string; phone: string; website: string; address: string };
export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "New" | "Read" | "Responded";
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
};

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  status: "Active" | "Inactive";
  description?: string;
};

type WorkspaceState = {
  products: AdminProduct[];
  categories: AdminCategory[];
  campaigns: AdminCampaign[];
  content: AdminContent;
  settings: AdminSettings;
  orderStatuses: Record<string, AdminOrder["status"]>;
  inquiries: AdminInquiry[];
  coupons: AdminCoupon[];
};
type AdminDataValue = WorkspaceState & {
  ready: boolean;
  orders: AdminOrder[];
  setProducts: Dispatch<SetStateAction<AdminProduct[]>>;
  setCategories: Dispatch<SetStateAction<AdminCategory[]>>;
  setCampaigns: Dispatch<SetStateAction<AdminCampaign[]>>;
  setContent: Dispatch<SetStateAction<AdminContent>>;
  setSettings: Dispatch<SetStateAction<AdminSettings>>;
  setInquiries: Dispatch<SetStateAction<AdminInquiry[]>>;
  setCoupons: Dispatch<SetStateAction<AdminCoupon[]>>;
  setOrderStatus: (id: string, status: AdminOrder["status"]) => Promise<boolean>;
  setInquiryStatus: (id: string, status: AdminInquiry["status"], reply?: string) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  syncToStrapi: (customProducts?: AdminProduct[]) => Promise<boolean>;
  syncWorkspace: (overrides?: Partial<WorkspaceState & { orders: AdminOrder[] }>) => Promise<boolean>;
};

const STORAGE_KEY = "swachetna-admin-workspace-v1";
const ORDER_STORAGE_KEY = "swachetna-demo-orders";
const initialProducts: AdminProduct[] = baseProducts.map((product) => ({ id: product.id, slug: product.slug, name: product.name, category: product.category, subcategory: product.subcategory, sku: product.sku, price: product.price, originalPrice: product.originalPrice, stock: product.stock, status: "Published" }));
const initialCategories: AdminCategory[] = baseCategories.map(({ slug, name, description, subcategories }) => ({ slug, name, description, subcategories }));
const initialContent: AdminContent = { title: "Work to create a difference.", description: "Swachetna Foundation works with communities across food security, education and wellbeing." };
const initialSettings: AdminSettings = { organization: "Swachetna Foundation", email: "hello@swachetna.org", phone: "", website: "https://swachetna.org", address: "Pune, Maharashtra, India" };

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [content, setContent] = useState(initialContent);
  const [settings, setSettings] = useState(initialSettings);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, AdminOrder["status"]>>({});
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([
    {
      id: "inq-sample-1",
      name: "Pooja Deshmukh",
      email: "pooja.d@gmail.com",
      phone: "+91 98234 56789",
      subject: "Bulk Order Inquiry for Diwali Corporate Gifting",
      message: "Hello Swachetna team, We are looking to order 50 gift hampers of organic laddu and traditional pickles for our company employees in Pune. Could you please share the corporate pricing catalogue and delivery timeline?",
      status: "New",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "inq-sample-2",
      name: "Rajesh Kulkarni",
      email: "rajesh.kulkarni@yahoo.com",
      phone: "+91 97654 32100",
      subject: "Handmade Terracotta Pottery Availability",
      message: "Namaste, I want to purchase 4 sets of hand-molded terracotta vases and diyas for our new home in Mumbai. Is shipping available with safe bubble wrapping?",
      status: "Read",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "inq-sample-3",
      name: "Sneha Patil",
      email: "sneha.patil@outlook.com",
      phone: "+91 91234 88990",
      subject: "NGO Artisan Collaboration",
      message: "Respected Team, We represent a self-help women artisans group in Satara specializing in handloom jute bags. We would love to collaborate with Swachetna Foundation to showcase our products on your platform.",
      status: "Responded",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([
    { id: "cpn-default-1", code: "SWACHETNA10", discountType: "percentage", discountValue: 10, minOrderAmount: 500, maxDiscount: 300, status: "Active", description: "10% off on orders above ₹500" },
    { id: "cpn-default-2", code: "ARTISAN100", discountType: "fixed", discountValue: 100, minOrderAmount: 800, status: "Active", description: "Flat ₹100 discount on authentic artisan crafts" }
  ]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      let loadedFromStrapi = false;
      try {
        const res = await fetch("/api/admin/workspace", { cache: "no-store" });
        const json = await res.json();
        const strapiData = json?.data;
        if (strapiData) {
          if (Array.isArray(strapiData.products) && strapiData.products.length > 0) {
            const mapped = strapiData.products.map((p: any, idx: number) => ({
              id: p.id ? String(p.id) : `strapi-${idx}`,
              slug: p.slug || "",
              name: p.name || "",
              description: p.description || "",
              category: p.category || "",
              subcategory: p.subcategory || "",
              sku: p.sku || "",
              price: Number(p.price) || 0,
              originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
              stock: Number(p.stock) || 0,
              status: p.status === "Draft" ? "Draft" : "Published",
              image: p.image || "",
              images: typeof p.images === "string" ? p.images.split(",").map((img: string) => img.trim()).filter(Boolean) : (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])),
              colors: typeof p.colors === "string" ? p.colors.split(",").map((c: string) => c.trim()).filter(Boolean) : (Array.isArray(p.colors) ? p.colors : []),
              sizes: typeof p.sizes === "string" ? p.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(p.sizes) ? p.sizes : []),
              variants: Array.isArray(p.variants) ? p.variants : [],
              reviews: Array.isArray(p.reviews) ? p.reviews : [],
            }));

            // Merge with authentic baseProducts so admin always sees authentic items with photos
            const baseIds = new Set(baseProducts.map((b) => b.id));
            const baseSlugs = new Set(baseProducts.map((b) => b.slug));
            const customProducts = mapped.filter((p: AdminProduct) => !baseIds.has(p.id) && !baseSlugs.has(p.slug));
            const enrichedBase = baseProducts.map((b) => {
              const match = mapped.find((p: AdminProduct) => p.id === b.id || p.slug === b.slug);
              if (!match) {
                return {
                  id: b.id,
                  slug: b.slug,
                  name: b.name,
                  category: b.category,
                  subcategory: b.subcategory,
                  sku: b.sku,
                  price: b.price,
                  originalPrice: b.originalPrice,
                  stock: b.stock,
                  status: "Published" as const,
                  image: b.image,
                  images: b.images,
                  colors: b.colors,
                  sizes: b.sizes,
                  variants: b.variants,
                };
              }
              return {
                id: b.id,
                slug: b.slug,
                name: match.name || b.name,
                category: match.category || b.category,
                subcategory: match.subcategory || b.subcategory,
                sku: match.sku || b.sku,
                price: match.price || b.price,
                originalPrice: match.originalPrice !== undefined ? match.originalPrice : b.originalPrice,
                stock: match.stock !== undefined ? match.stock : b.stock,
                status: match.status || "Published",
                image: match.image || b.image,
                images: (match.images && match.images.length > 0) ? match.images : b.images,
                colors: match.colors || b.colors,
                sizes: match.sizes || b.sizes,
                variants: match.variants || b.variants,
              };
            });

            const mergedAdminProducts = [...enrichedBase, ...customProducts];
            setProducts(mergedAdminProducts);
            // Save to localStorage immediately
            try {
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                products: mergedAdminProducts,
                categories: strapiData.categories || [],
                campaigns: strapiData.campaigns || [],
                content: strapiData.content || initialContent,
                settings: strapiData.settings || initialSettings,
              }));
            } catch { /* ignore */ }
          }
          if (Array.isArray(strapiData.categories) && strapiData.categories.length > 0) {
            setCategories(strapiData.categories.map((c: any) => ({
              slug: c.slug,
              name: c.name,
              description: c.description || "",
              subcategories: typeof c.subcategories === "string" ? c.subcategories.split(",").map((s: string) => s.trim()).filter(Boolean) : (c.subcategories || []),
            })));
          }
          if (Array.isArray(strapiData.campaigns) && strapiData.campaigns.length > 0) {
            setCampaigns(strapiData.campaigns.map((c: any, idx: number) => ({
              id: c.id ? String(c.id) : `camp-${idx}`,
              name: c.name || "",
              area: c.area || "",
              status: c.status === "Draft" ? "Draft" : "Active",
            })));
          }
          if (strapiData.content && strapiData.content.title) {
            setContent(strapiData.content);
          }
          if (strapiData.settings && strapiData.settings.organization) {
            setSettings((prev) => ({ ...prev, ...strapiData.settings }));
          }
          if (Array.isArray(strapiData.orders) && strapiData.orders.length > 0) {
            const strapiOrders: AdminOrder[] = strapiData.orders.map((o: any, idx: number) => ({
              id: o.orderId || `order-${idx}`,
              customer: o.customer || "Anonymous",
              customerEmail: o.customerEmail || "",
              customerPhone: o.customerPhone || "",
              customerAddress: o.customerAddress || "",
              items: Array.isArray(o.items) ? o.items : [],
              total: Number(o.total) || 0,
              createdAt: o.orderDate || new Date().toISOString(),
              paymentMethod: o.paymentMethod || "UPI",
              status: (o.status as AdminOrder["status"]) || "Pending",
            }));
            setOrders(strapiOrders);
          }
          if (Array.isArray(strapiData.inquiries) && strapiData.inquiries.length > 0) {
            const mappedInquiries: AdminInquiry[] = strapiData.inquiries.map((inq: any, idx: number) => ({
              id: inq.id ? String(inq.id) : `inq-${idx}`,
              name: inq.name || "Anonymous",
              email: inq.email || "",
              phone: inq.phone || "",
              subject: inq.subject || "General Inquiry",
              message: inq.message || "",
              status: (inq.status as AdminInquiry["status"]) || "New",
              createdAt: inq.createdAt || new Date().toISOString(),
            }));
            setInquiries(mappedInquiries);
          }
          if (Array.isArray(strapiData.coupons) && strapiData.coupons.length > 0) {
            const mappedCoupons: AdminCoupon[] = strapiData.coupons.map((c: any, idx: number) => ({
              id: c.id ? String(c.id) : `cpn-${idx}`,
              code: String(c.code || "").toUpperCase(),
              discountType: c.discountType === "fixed" ? "fixed" : "percentage",
              discountValue: Number(c.discountValue) || 0,
              minOrderAmount: Number(c.minOrderAmount) || 0,
              maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
              status: c.status === "Inactive" ? "Inactive" : "Active",
              description: c.description || "",
            }));
            setCoupons(mappedCoupons);
          }
          loadedFromStrapi = true;
        }
      } catch (err) {
        console.warn("Strapi workspace fetch skipped, falling back to local:", err);
      }

      if (!loadedFromStrapi) {
        try {
          const stored = window.localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as Partial<WorkspaceState>;
            if (Array.isArray(parsed.products) && parsed.products.length > 0) setProducts(parsed.products.filter(isAdminProduct));
            else setProducts(initialProducts);
            if (Array.isArray(parsed.categories) && parsed.categories.length > 0) setCategories(parsed.categories.filter(isAdminCategory));
            else setCategories(initialCategories);
            if (Array.isArray(parsed.campaigns)) setCampaigns(parsed.campaigns.filter(isAdminCampaign));
            if (parsed.content && typeof parsed.content.title === "string" && typeof parsed.content.description === "string") setContent(parsed.content);
            if (parsed.settings && typeof parsed.settings.organization === "string") setSettings({ ...initialSettings, ...parsed.settings });
            if (parsed.orderStatuses && typeof parsed.orderStatuses === "object") setOrderStatuses(parsed.orderStatuses);
            if (Array.isArray(parsed.inquiries)) setInquiries(parsed.inquiries);
          } else {
            setProducts(initialProducts);
            setCategories(initialCategories);
          }
        } catch {
          setProducts(initialProducts);
          setCategories(initialCategories);
        }
      }

      const syncLocalOrders = () => {
        try {
          const rawOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
          const parsedOrders: unknown = rawOrders ? JSON.parse(rawOrders) : [];
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            const valid = parsedOrders.filter(isLocalOrder).map((order) => {
              const addressParts = [order.customer.address, order.customer.city, order.customer.state, order.customer.postalCode].filter(Boolean);
              return {
                id: order.reference,
                customer: order.customer.name,
                customerEmail: order.customer.email || "",
                customerPhone: order.customer.phone || "",
                customerAddress: addressParts.join(", ") || "",
                items: Array.isArray(order.items) ? order.items : [],
                total: order.total,
                createdAt: order.createdAt,
                paymentMethod: order.paymentMethod,
                status: (order.status as AdminOrder["status"]) || "Pending",
              };
            });
            setOrders((prev) => {
              const merged = [...valid, ...prev];
              return [...new Map(merged.map((o) => [o.id, o])).values()];
            });
          }
        } catch { /* ignore */ }
      };

      syncLocalOrders();
      setReady(true);
    }

    loadData();

    // Real-time synchronization across tabs and in-page events without page refresh
    const handleOrderSync = () => {
      try {
        const rawOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
        const parsedOrders: unknown = rawOrders ? JSON.parse(rawOrders) : [];
        if (Array.isArray(parsedOrders)) {
          const valid = parsedOrders.filter(isLocalOrder).map((order) => {
            const addressParts = [order.customer.address, order.customer.city, order.customer.state, order.customer.postalCode].filter(Boolean);
            return {
              id: order.reference,
              customer: order.customer.name,
              customerEmail: order.customer.email || "",
              customerPhone: order.customer.phone || "",
              customerAddress: addressParts.join(", ") || "",
              items: Array.isArray(order.items) ? order.items : [],
              total: order.total,
              createdAt: order.createdAt,
              paymentMethod: order.paymentMethod,
              status: (order.status as AdminOrder["status"]) || "Pending",
            };
          });
          setOrders((prev) => {
            const merged = [...valid, ...prev];
            return [...new Map(merged.map((o) => [o.id, o])).values()];
          });
        }
      } catch { /* ignore */ }
    };

    window.addEventListener("swachetna-orders-updated", handleOrderSync);
    window.addEventListener("storage", handleOrderSync);

    // Periodic live background sync every 3 seconds to keep real-time orders live without refresh
    const timer = window.setInterval(handleOrderSync, 3000);

    return () => {
      window.removeEventListener("swachetna-orders-updated", handleOrderSync);
      window.removeEventListener("storage", handleOrderSync);
      window.clearInterval(timer);
    };
  }, []);

  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Auto-sync debounced effect when user modifies any data
  useEffect(() => {
    if (!ready || !hasUserEdited) return;
    const stored: WorkspaceState = { products, categories, campaigns, content, settings, orderStatuses, inquiries, coupons };
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch { /* Ignore */ }
  }, [products, categories, campaigns, content, settings, orderStatuses, inquiries, coupons, ready, hasUserEdited]);

  const syncWorkspace = async (overrides?: Partial<WorkspaceState & { orders: AdminOrder[] }>): Promise<boolean> => {
    try {
      const prodsToSave = overrides?.products || products;
      const catsToSave = overrides?.categories || categories;
      const campsToSave = overrides?.campaigns || campaigns;
      const contentToSave = overrides?.content || content;
      const settingsToSave = overrides?.settings || settings;
      const ordersToSave = overrides?.orders || orders;
      const orderStatusesToUse = overrides?.orderStatuses || orderStatuses;
      const inqsToSave = overrides?.inquiries || inquiries;
      const couponsToSave = overrides?.coupons || coupons;

      const payload = {
        products: prodsToSave.map(({ id, ...rest }) => ({
          ...rest,
          images: Array.isArray(rest.images) ? rest.images.join(", ") : (rest.images || ""),
          colors: Array.isArray(rest.colors) ? rest.colors.join(", ") : (rest.colors || ""),
          sizes: Array.isArray(rest.sizes) ? rest.sizes.join(", ") : (rest.sizes || ""),
          variants: Array.isArray(rest.variants) ? rest.variants : [],
          reviews: Array.isArray(rest.reviews) ? rest.reviews : []
        })),
        categories: catsToSave.map((c) => ({
          ...c,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories.join(", ") : (c.subcategories || "")
        })),
        campaigns: campsToSave.map(({ id, ...rest }) => rest),
        content: contentToSave,
        settings: settingsToSave,
        orders: ordersToSave.map(({ id, ...rest }) => ({
          ...rest,
          orderId: id,
          status: orderStatusesToUse[id] ?? rest.status,
        })),
        inquiries: inqsToSave.map(({ id, ...rest }) => rest),
        coupons: couponsToSave.map(({ id, ...rest }) => rest),
      };

      const res = await fetch("/api/admin/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to sync workspace via route:", await res.text());
        return false;
      }

      // Update local storage cache immediately with latest state
      try {
        const stored = {
          products: prodsToSave,
          categories: catsToSave,
          campaigns: campsToSave,
          content: contentToSave,
          settings: settingsToSave,
          orderStatuses: orderStatusesToUse,
          inquiries: inqsToSave,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch { /* ignore */ }

      return true;
    } catch (syncErr) {
      console.error("Strapi workspace sync error:", syncErr);
      return false;
    }
  };

  const syncToStrapi = async (customProducts?: AdminProduct[]): Promise<boolean> => {
    return syncWorkspace(customProducts ? { products: customProducts } : undefined);
  };

  const setOrderStatus = async (id: string, status: AdminOrder["status"]): Promise<boolean> => {
    const updatedStatuses = { ...orderStatuses, [id]: status };
    setOrderStatuses(updatedStatuses);
    return syncWorkspace({ orderStatuses: updatedStatuses });
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    const updatedOrders = orders.filter((o) => o.id !== id);
    setOrders(updatedOrders);

    // Update local storage demo orders
    try {
      const rawOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);
      const parsed = rawOrders ? JSON.parse(rawOrders) : [];
      if (Array.isArray(parsed)) {
        const remaining = parsed.filter((o: any) => o.reference !== id && o.id !== id);
        window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(remaining));
      }
      // Also track deleted order ids so sample orders don't reappear if user deletes sample order
      const deletedRaw = window.localStorage.getItem("swachetna-deleted-order-ids");
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      window.localStorage.setItem("swachetna-deleted-order-ids", JSON.stringify([...new Set([...deletedIds, id])]));
    } catch { /* ignore */ }

    // Sync to Strapi workspace
    return syncWorkspace({ orders: updatedOrders });
  };

  const setInquiryStatus = async (id: string, status: AdminInquiry["status"], reply?: string): Promise<boolean> => {
    const updatedInqs = inquiries.map((inq) => {
      if (inq.id === id) {
        return {
          ...inq,
          status,
          ...(reply !== undefined ? { adminReply: reply, repliedAt: new Date().toISOString() } : {})
        };
      }
      return inq;
    });
    setInquiries(updatedInqs);
    return syncWorkspace({ inquiries: updatedInqs });
  };

  const setProductsWithEdit: Dispatch<SetStateAction<AdminProduct[]>> = (action) => {
    setHasUserEdited(true);
    setProducts(action);
  };

  const setCategoriesWithEdit: Dispatch<SetStateAction<AdminCategory[]>> = (action) => {
    setHasUserEdited(true);
    setCategories(action);
  };

  const value = useMemo<AdminDataValue>(() => ({
    products, categories, campaigns, content, settings, orderStatuses, inquiries, coupons, orders: orders.map((order) => ({ ...order, status: orderStatuses[order.id] ?? order.status })), ready,
    setProducts: setProductsWithEdit, setCategories: setCategoriesWithEdit, setCampaigns, setContent, setSettings, setInquiries, setCoupons, setOrderStatus, setInquiryStatus, deleteOrder, syncToStrapi, syncWorkspace,
  }), [products, categories, campaigns, content, settings, orderStatuses, inquiries, coupons, orders, ready]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error("useAdminData must be used inside AdminDataProvider");
  return context;
}

function isAdminProduct(value: unknown): value is AdminProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Partial<AdminProduct>;
  return typeof product.id === "string" && typeof product.slug === "string" && typeof product.name === "string" && (product.description === undefined || typeof product.description === "string") && typeof product.category === "string" && typeof product.sku === "string" && typeof product.price === "number" && typeof product.stock === "number" && (product.status === "Published" || product.status === "Draft") && (product.image === undefined || typeof product.image === "string");
}
function isAdminCategory(value: unknown): value is AdminCategory {
  if (!value || typeof value !== "object") return false;
  const category = value as Partial<AdminCategory>;
  return typeof category.slug === "string" && typeof category.name === "string" && typeof category.description === "string";
}
function isAdminCampaign(value: unknown): value is AdminCampaign {
  if (!value || typeof value !== "object") return false;
  const campaign = value as Partial<AdminCampaign>;
  return typeof campaign.id === "string" && typeof campaign.name === "string" && typeof campaign.area === "string" && (campaign.status === "Active" || campaign.status === "Draft");
}
function isLocalOrder(value: unknown): value is {
  reference: string;
  total: number;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  items?: OrderItem[];
  createdAt: string;
  paymentMethod?: string;
  status?: string;
} {
  if (!value || typeof value !== "object") return false;
  const order = value as { reference?: unknown; total?: unknown; customer?: { name?: unknown }; createdAt?: unknown };
  return typeof order.reference === "string" && typeof order.total === "number" && typeof order.customer?.name === "string" && typeof order.createdAt === "string";
}
