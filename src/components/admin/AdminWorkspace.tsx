"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Download, ExternalLink, Eye, FileText, Filter, HeartHandshake, MoreHorizontal, Package, Plus, Printer, Search, Shapes, ShoppingCart, SlidersHorizontal, Sparkles, Trash2, TrendingUp, Truck, Upload, Users, X } from "lucide-react";
import { formatCurrency } from "../../data/products";
import { useAdminData, type AdminCampaign, type AdminCategory, type AdminCoupon, type AdminOrder, type AdminProduct } from "./AdminData";
import styles from "./Admin.module.css";

type Section = "dashboard" | "products" | "inventory" | "orders" | "inquiries" | "coupons" | "reviews" | "customers" | "categories" | "reports" | "content" | "campaigns" | "settings";
const samplePreviewOrders: AdminOrder[] = [
  {
    id: "SW-ORD-8821",
    customer: "Punam Rajendra Daware",
    customerEmail: "dawarepunam82@gmail.com",
    customerPhone: "+91 88560 17832",
    customerAddress: "Flat 402, Shivajinagar, Pune, Maharashtra 411005",
    total: 2450,
    createdAt: "2026-11-01T10:30:00.000Z",
    status: "Processing",
    paymentMethod: "UPI",
    items: [
      { id: "it-1", name: "Gaon-style Homemade Traditional Pickle (500g)", price: 380, quantity: 2, sku: "SW-FD-010" },
      { id: "it-2", name: "Organic Dink & Dryfruit Energy Laddu (1kg)", price: 650, quantity: 2, sku: "SW-FD-011" },
      { id: "it-3", name: "Hand-finished Terracotta Vase", price: 390, quantity: 1, sku: "SW-HL-001" },
    ]
  },
  {
    id: "SW-ORD-8819",
    customer: "Aarohi Deshmukh",
    customerEmail: "aarohi.deshmukh@gmail.com",
    customerPhone: "+91 98220 44551",
    customerAddress: "Plot 12, Baner Road, Pune, Maharashtra 411045",
    total: 1890,
    createdAt: "2026-10-28T14:15:00.000Z",
    status: "Delivered",
    paymentMethod: "UPI",
    items: [
      { id: "it-4", name: "Sun-Dried Crisp Urad Dal Papad (500g)", price: 250, quantity: 3, sku: "SW-FD-015" },
      { id: "it-5", name: "Stone-Ground Authentic Goda Masala", price: 320, quantity: 2, sku: "SW-FD-018" },
      { id: "it-6", name: "Natural Handmade Jute Tote Bag", price: 500, quantity: 1, sku: "SW-CL-014" },
    ]
  },
  {
    id: "SW-ORD-8814",
    customer: "Meera Joshi",
    customerEmail: "meera.joshi@outlook.com",
    customerPhone: "+91 97654 11223",
    customerAddress: "Kothrud, Pune, Maharashtra 411038",
    total: 3250,
    createdAt: "2026-10-25T11:45:00.000Z",
    status: "Shipped",
    paymentMethod: "Cash on delivery",
    items: [
      { id: "it-7", name: "The Thoughtful Artisan Festive Hamper", price: 2250, quantity: 1, sku: "SW-GF-012" },
      { id: "it-8", name: "Traditional Brass Carved Diya Stand", price: 1000, quantity: 1, sku: "SW-HL-009" },
    ]
  },
  {
    id: "SW-ORD-8809",
    customer: "Kabir Patil",
    customerEmail: "kabir.patil@yahoo.com",
    customerPhone: "+91 99231 77665",
    customerAddress: "Dharampeth, Nagpur, Maharashtra 440010",
    total: 1460,
    createdAt: "2026-10-20T09:20:00.000Z",
    status: "Pending",
    paymentMethod: "UPI",
    items: [
      { id: "it-9", name: "Activated Charcoal Soap (Pack of 4)", price: 460, quantity: 1, sku: "SW-710372" },
      { id: "it-10", name: "Classic Scented Candle Gift Set", price: 1000, quantity: 1, sku: "SW-118718" },
    ]
  },
  {
    id: "SW-ORD-8802",
    customer: "Sana Shaikh",
    customerEmail: "sana.shaikh@gmail.com",
    customerPhone: "+91 98811 33221",
    customerAddress: "Viman Nagar, Pune, Maharashtra 411014",
    total: 2780,
    createdAt: "2026-10-15T16:40:00.000Z",
    status: "Delivered",
    paymentMethod: "Card",
    items: [
      { id: "it-11", name: "Organic Khadi Cotton Table Linen", price: 1099, quantity: 1, sku: "SW-HL-005" },
      { id: "it-12", name: "Artisan Mini Gift Box - A Little Thank You", price: 599, quantity: 2, sku: "SW-GF-006" },
      { id: "it-13", name: "Aloe Vera Handmade Herbal Soap", price: 482, quantity: 1, sku: "SW-495994" },
    ]
  }
];
const titles: Record<Section, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: "WORKSPACE OVERVIEW", title: "Your foundation at a glance", description: "A current view of the products and orders saved in this browser." },
  products: { eyebrow: "YOUR CATALOG", title: "Products", description: "Manage your collection, pricing and product visibility." },
  inventory: { eyebrow: "STOCK CONTROL", title: "Inventory", description: "Review available stock and update quantities." },
  orders: { eyebrow: "STORE ACTIVITY", title: "Orders", description: "Review locally stored orders and update their status." },
  coupons: { eyebrow: "DISCOUNTS & PROMOTIONS", title: "Coupons & Promo Codes", description: "Create and manage discount codes for the Swachetna Foundation storefront." },
  reviews: { eyebrow: "CUSTOMER FEEDBACK", title: "Product Reviews & Ratings", description: "Review, moderate, and approve customer ratings for handcrafted products." },
  inquiries: { eyebrow: "MESSAGES & CONTACT", title: "Inquiries", description: "Read and manage messages received from the storefront contact form." },
  customers: { eyebrow: "YOUR COMMUNITY", title: "Customers", description: "Customers are listed here when an order is recorded in this browser." },
  categories: { eyebrow: "COLLECTION ORGANIZATION", title: "Categories", description: "Arrange products into collections that are easy to browse." },
  reports: { eyebrow: "PERFORMANCE", title: "Reports & insights", description: "Sales totals are calculated from the orders available in this browser." },
  content: { eyebrow: "STOREFRONT EDITOR", title: "Website content", description: "Edit the headline and introduction used in this workspace." },
  campaigns: { eyebrow: "COMMUNITY PROGRAMS", title: "Campaigns & programs", description: "Manage foundation initiatives and community stories." },
  settings: { eyebrow: "WORKSPACE PREFERENCES", title: "Settings", description: "Update organization details saved in this browser." },
};

export default function AdminWorkspace({ section, initialProductDialog = false }: { section: Section; initialProductDialog?: boolean }) {
  const router = useRouter();
  const data = useAdminData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [stockFilter, setStockFilter] = useState("All stock levels");
  const [sort, setSort] = useState("name");
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const [quickActions, setQuickActions] = useState(false);
  const [productDialog, setProductDialog] = useState(initialProductDialog);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [subcollectionDialog, setSubcollectionDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [toast, setToast] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignArea, setCampaignArea] = useState("Community wellbeing");
  const [campaignStatus, setCampaignStatus] = useState<AdminCampaign["status"]>("Active");
  const [contentTitle, setContentTitle] = useState(data.content.title);
  const [contentDescription, setContentDescription] = useState(data.content.description);
  const [settingsDraft, setSettingsDraft] = useState(data.settings);
  useEffect(() => { if (initialProductDialog) setProductDialog(true); }, [initialProductDialog]);
  useEffect(() => {
    if (!data.ready) return;
    setContentTitle(data.content.title);
    setContentDescription(data.content.description);
    setSettingsDraft(data.settings);
  }, [data.ready, data.content, data.settings]);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const page = titles[section];
  const visibleProducts = useMemo(() => {
    const filtered = data.products.filter((product) => {
      const textMatch = `${product.name} ${product.category} ${product.sku}`.toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilter === "All statuses" || product.status === statusFilter;
      const categoryMatch = categoryFilter === "All categories" || product.category === categoryFilter;
      const stockMatch = stockFilter === "All stock levels" || (stockFilter === "Low stock" ? product.stock > 0 && product.stock < 10 : stockFilter === "Out of stock" ? product.stock === 0 : product.stock >= 10);
      return textMatch && statusMatch && categoryMatch && stockMatch;
    });
    return filtered.sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "stock-low" ? a.stock - b.stock : a.name.localeCompare(b.name));
  }, [data.products, search, statusFilter, categoryFilter, stockFilter, sort]);
  const [deletedOrderIds, setDeletedOrderIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("swachetna-deleted-order-ids");
      if (stored) setDeletedOrderIds(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const orderRecords = useMemo(() => {
    const raw = data.orders.length ? data.orders : samplePreviewOrders.map((order) => ({ ...order, status: data.orderStatuses[order.id] ?? order.status }));
    return raw.filter((order) => !deletedOrderIds.includes(order.id));
  }, [data.orders, data.orderStatuses, deletedOrderIds]);
  const visibleOrders = useMemo(() => orderRecords.filter((order) => `${order.id} ${order.customer}`.toLowerCase().includes(search.toLowerCase()) && (statusFilter === "All statuses" || order.status === statusFilter)), [orderRecords, search, statusFilter]);

  const [savingProduct, setSavingProduct] = useState(false);

  const saveProduct = async (product: Omit<AdminProduct, "id" | "slug"> & { id?: string; slug?: string }) => {
    const duplicateSku = data.products.some((item) => item.sku.trim().toLowerCase() === product.sku.trim().toLowerCase() && String(item.id) !== String(product.id) && item.slug !== product.slug);
    if (duplicateSku) { notify("That SKU is already used by another product."); return false; }
    const slug = product.slug || product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const next: AdminProduct = { ...product, id: product.id || `admin-${createLocalId()}`, slug, status: product.status ?? "Published" };
    
    let updatedProducts: AdminProduct[] = [];
    const current = data.products;
    const exists = current.some((item) => (product.id && String(item.id) === String(product.id)) || item.slug === slug);
    if (exists) {
      updatedProducts = current.map((item) => ((product.id && String(item.id) === String(product.id)) || item.slug === slug) ? next : item);
    } else {
      updatedProducts = [next, ...current];
    }
    data.setProducts(updatedProducts);

    try {
      setSavingProduct(true);
      const ok = await data.syncToStrapi(updatedProducts);
      if (ok) {
        notify(product.id ? "Product changes saved to database!" : "Product added to catalog!");
      } else {
        notify("Changes saved locally, but database sync had an issue.");
      }
    } finally {
      setSavingProduct(false);
    }

    setProductDialog(false); 
    setEditingProduct(null); 
    if (initialProductDialog) router.replace("/admin/products");
    return true;
  };
  const closeProductDialog = () => { setProductDialog(false); setEditingProduct(null); if (initialProductDialog) router.replace("/admin/products"); };
  
  const updateStock = async (id: string, adjustment: number) => {
    const updated = data.products.map((product) => product.id === id ? { ...product, stock: Math.max(0, product.stock + adjustment) } : product);
    data.setProducts(updated);
    await data.syncWorkspace({ products: updated });
    notify("Stock updated and saved to database.");
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}? This cannot be undone.`)) return;
    setDeletedOrderIds((prev) => [...prev, orderId]);
    const ok = await data.deleteOrder(orderId);
    notify(ok ? `Order ${orderId} deleted successfully.` : `Order ${orderId} removed from workspace.`);
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    const updated = data.products.filter((item) => item.id !== product.id);
    data.setProducts(updated);
    const ok = await data.syncWorkspace({ products: updated });
    notify(ok ? "Product deleted from database." : "Product removed locally.");
  };

  const saveCategory = async (name: string, description: string, subcategories: string[], gstRate?: number, hsnCode?: string) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (data.categories.some((category) => category.slug === slug && category.slug !== editingCategory?.slug)) { notify("A collection with that name already exists."); return false; }
    const next: AdminCategory = { slug, name, description, subcategories, gstRate, hsnCode };
    const updated = editingCategory ? data.categories.map((category) => category.slug === editingCategory.slug ? next : category) : [...data.categories, next];
    data.setCategories(updated);
    setCategoryDialog(false); 
    setEditingCategory(null); 
    const ok = await data.syncWorkspace({ categories: updated });
    notify(ok ? "Collection saved to database." : "Collection saved locally.");
    return true;
  };

  const handleDeleteCategory = async (category: AdminCategory) => {
    if (!window.confirm(`Delete ${category.name}? Products in this collection will remain in the catalog.`)) return;
    const updated = data.categories.filter((item) => item.slug !== category.slug);
    data.setCategories(updated);
    const ok = await data.syncWorkspace({ categories: updated });
    notify(ok ? "Collection removed from database." : "Collection removed locally.");
  };

  const addCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaignName.trim()) return;
    const newCamp: AdminCampaign = { id: crypto.randomUUID(), name: campaignName.trim(), area: campaignArea, status: campaignStatus };
    const updated = [newCamp, ...data.campaigns];
    data.setCampaigns(updated);
    setCampaignName(""); 
    const ok = await data.syncWorkspace({ campaigns: updated });
    notify(ok ? "Program saved to database." : "Program saved.");
  };

  const handleDeleteCampaign = async (id: string) => {
    const updated = data.campaigns.filter((c) => c.id !== id);
    data.setCampaigns(updated);
    await data.syncWorkspace({ campaigns: updated });
    notify("Program removed from database.");
  };

  const handleUpdateCampaign = async (id: string, status: AdminCampaign["status"]) => {
    const updated = data.campaigns.map((c) => c.id === id ? { ...c, status } : c);
    data.setCampaigns(updated);
    await data.syncWorkspace({ campaigns: updated });
    notify("Program status updated.");
  };

  const applyContent = async (event: FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    const updated = { title: contentTitle.trim(), description: contentDescription.trim() };
    data.setContent(updated); 
    const ok = await data.syncWorkspace({ content: updated });
    notify(ok ? "Website copy saved to database." : "Website copy saved."); 
  };

  const applySettings = async (event: FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    data.setSettings(settingsDraft); 
    const ok = await data.syncWorkspace({ settings: settingsDraft });
    notify(ok ? "Organization details saved to database." : "Organization details saved."); 
  };

  return <div className={styles.workspace}>
    <div className={styles.pageHeading}><div><span className={styles.eyebrow}>{page.eyebrow}</span><h1>{page.title}</h1><p>{page.description}</p></div><div className={styles.headingActions}>
      {section === "dashboard" && <button type="button" className={styles.secondaryButton} onClick={() => { const sample = data.orders.length === 0; const ok = exportOrders(orderRecords, sample); notify(ok ? (sample ? "Preview sample orders downloaded." : "Orders downloaded successfully.") : "Could not download the orders file."); }}><Download size={15} /> Export orders</button>}
      {section === "inventory" && <button type="button" className={`${styles.secondaryButton} ${advancedFilters ? styles.filterActive : ""}`} aria-expanded={advancedFilters} onClick={() => setAdvancedFilters((value) => !value)}><SlidersHorizontal size={15} /> More filters</button>}
      {section === "products" && <Link href="/admin/products/new" className={`${styles.primaryButton} ${styles.addProductButton}`}><Plus size={16} /> Add product</Link>}
      {section === "categories" && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setSubcollectionDialog(true)}
            style={{ fontWeight: 600 }}
          >
            <Plus size={15} /> Add sub-collection
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            aria-haspopup="dialog"
            aria-controls="category-dialog"
            onClick={() => { setEditingCategory(null); setCategoryDialog(true); }}
          >
            <Plus size={16} /> Add collection
          </button>
        </div>
      )}
      {section === "campaigns" && <a className={styles.secondaryButton} href="#new-program"><Plus size={15} /> New program</a>}
    </div></div>

    {section === "dashboard" && <>{data.ready && data.orders.length === 0 && <div className={styles.demoBanner}><span><Sparkles size={14} /> SAMPLE DATA</span><p>Preview orders help explain this dashboard. They are examples only and are not saved as real sales.</p></div>}<Dashboard products={data.products} orders={data.orders.length ? data.orders : samplePreviewOrders} isPreview={!data.orders.length} onQuick={() => setQuickActions((value) => !value)} quickOpen={quickActions} onSelectOrder={(order) => setSelectedOrder(order)} /></>}
    {section === "products" && (
      <ProductSection
        allProducts={data.products}
        products={visibleProducts}
        categories={data.categories}
        search={search}
        onSearch={setSearch}
        category={categoryFilter}
        onCategory={setCategoryFilter}
        status={statusFilter}
        onStatus={setStatusFilter}
        stock={stockFilter}
        onStock={setStockFilter}
        sort={sort}
        onSort={setSort}
        onEdit={(product) => { setEditingProduct(product); setProductDialog(true); }}
        onDelete={handleDeleteProduct}
      />
    )}
    {section === "inventory" && (
      <InventorySection
        allProducts={data.products}
        products={visibleProducts}
        categories={data.categories}
        search={search}
        onSearch={setSearch}
        category={categoryFilter}
        onCategory={setCategoryFilter}
        stock={stockFilter}
        onStock={setStockFilter}
        sort={sort}
        onSort={setSort}
        advanced={advancedFilters}
        onAdjust={updateStock}
      />
    )}
    {section === "orders" && <>{data.ready && data.orders.length === 0 && <div className={styles.demoBanner}><span><Sparkles size={14} /> SAMPLE ORDERS</span><p>These example orders are for preview only. They are not real purchases and are not saved as store orders.</p></div>}<OrdersSection orders={visibleOrders} isPreview={!data.orders.length} search={search} onSearch={setSearch} status={statusFilter} onStatusFilter={setStatusFilter} onStatus={(id, status) => data.setOrderStatus(id, status)} onDeleteOrder={handleDeleteOrder} onExport={() => exportOrders(orderRecords)} onSelectOrder={(order) => setSelectedOrder(order)} /></>}
    {section === "coupons" && <CouponsSection coupons={data.coupons} onSave={(updated) => data.syncWorkspace({ coupons: updated })} />}
    {section === "reviews" && <ReviewsSection products={data.products} onSaveProducts={(updated) => data.syncWorkspace({ products: updated })} />}
    {section === "inquiries" && <InquiriesSection inquiries={data.inquiries} onStatus={(id, status, reply) => data.setInquiryStatus(id, status, reply)} />}
    {section === "customers" && <>{data.ready && data.orders.length === 0 && <div className={styles.demoBanner}><span><Sparkles size={14} /> SAMPLE CUSTOMERS</span><p>Example customer records are shown for preview and are not real purchases.</p></div>}<CustomersSection orders={data.orders.length ? data.orders : samplePreviewOrders} isPreview={!data.orders.length} search={search} onSearch={setSearch} /></>}
    {section === "categories" && <CategoriesSection categories={data.categories} products={data.products} onEdit={(category) => { setEditingCategory(category); setCategoryDialog(true); }} onDelete={handleDeleteCategory} />}
    {section === "reports" && <ReportsSection products={data.products} orders={data.orders} />}
    {section === "content" && <ContentSection title={contentTitle} description={contentDescription} onTitle={setContentTitle} onDescription={setContentDescription} onSubmit={applyContent} />}
    {section === "campaigns" && <CampaignSection campaigns={data.campaigns} name={campaignName} onName={setCampaignName} area={campaignArea} onArea={setCampaignArea} status={campaignStatus} onStatus={setCampaignStatus} onSubmit={addCampaign} onDelete={handleDeleteCampaign} onUpdate={handleUpdateCampaign} />}
    {section === "settings" && <SettingsSection value={settingsDraft} onChange={setSettingsDraft} onSubmit={applySettings} />}

    <div className={styles.storageNote} role="note"><span className={styles.storageNoteIcon}><CheckCircle2 size={14} /></span><span className={styles.storageNoteCopy}><strong>Live Strapi Backend Connected</strong><small>Products, Categories, and Orders are synchronized with Strapi database.</small></span></div>
    {toast && <div className={styles.toast} role="status"><span><Check size={16} /></span>{toast}<button type="button" onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
    {productDialog && <ProductDialog product={editingProduct} categories={data.categories} onClose={closeProductDialog} returnToProducts={initialProductDialog} onSave={saveProduct} />}
    {categoryDialog && <CategoryDialog category={editingCategory} onClose={() => { setCategoryDialog(false); setEditingCategory(null); }} onSave={saveCategory} />}
    {subcollectionDialog && (
      <SubcollectionDialog
        categories={data.categories}
        onClose={() => setSubcollectionDialog(false)}
        onSave={async (parentCategoryName, newSubName) => {
          const parent = data.categories.find((c) => c.name.toLowerCase() === parentCategoryName.toLowerCase());
          if (!parent) {
            notify("Selected collection not found.");
            return false;
          }
          const existingSubs = Array.isArray(parent.subcategories)
            ? [...parent.subcategories]
            : (parent.subcategories ? String(parent.subcategories).split(",").map((s) => s.trim()).filter(Boolean) : []);
          
          if (existingSubs.some((s) => s.toLowerCase() === newSubName.toLowerCase())) {
            notify(`"${newSubName}" already exists in ${parent.name}.`);
            return false;
          }

          const updatedSubs = [...existingSubs, newSubName];
          const updatedCategories = data.categories.map((c) =>
            c.slug === parent.slug ? { ...c, subcategories: updatedSubs } : c
          );

          data.setCategories(updatedCategories);
          setSubcollectionDialog(false);
          const ok = await data.syncWorkspace({ categories: updatedCategories });
          notify(ok ? `"${newSubName}" added to ${parent.name}!` : "Sub-collection saved locally.");
          return true;
        }}
      />
    )}
    {selectedOrder && <OrderDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={(newStatus) => { data.setOrderStatus(selectedOrder.id, newStatus); setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null); notify(`Order ${selectedOrder.id} status updated to ${newStatus}`); }} />}
  </div>;
}

function Dashboard({ products, orders, isPreview, onQuick, quickOpen, onSelectOrder }: { products: AdminProduct[]; orders: AdminOrder[]; isPreview: boolean; onQuick: () => void; quickOpen: boolean; onSelectOrder?: (order: AdminOrder) => void }) {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const customers = new Set(orders.map((order) => order.customer.trim().toLowerCase()).filter(Boolean)).size;
  const average = orders.length ? Math.round(revenue / orders.length) : 0;
  const lowStock = products.filter((product) => product.stock > 0 && product.stock < 10);
  const months = useMemo(() => monthSeries(orders), [orders]);
  const maxRevenue = Math.max(1, ...months.map((month) => month.total));
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const pending = orders.filter((order) => order.status === "Pending" || order.status === "Processing").length;
  const shipped = orders.filter((order) => order.status === "Shipped").length;
  const totalOrders = orders.length;

  const fulfillmentStatuses = [
    { label: "Delivered", description: "Successfully completed", value: delivered, icon: CheckCircle2, className: styles.fulfillmentDelivered, href: "/admin/orders" },
    { label: "In progress", description: "Processing and pending", value: pending, icon: Clock3, className: styles.fulfillmentPending, href: "/admin/orders" },
    { label: "Shipped", description: "On the way", value: shipped, icon: Truck, className: styles.fulfillmentShipped, href: "/admin/orders" },
  ];

  const metricData = [
    {
      label: isPreview ? "Sample revenue" : "Recorded revenue",
      value: formatCurrency(revenue),
      delta: isPreview ? "Click to view sales reports" : `${orders.length} recorded orders · View reports →`,
      icon: TrendingUp,
      tint: "purple",
      href: "/admin/reports"
    },
    {
      label: "Orders",
      value: String(orders.length),
      delta: isPreview ? "Click to manage orders & dispatches" : `${pending} need attention · Manage →`,
      icon: Package,
      tint: "peach",
      href: "/admin/orders"
    },
    {
      label: "Customers",
      value: String(customers),
      delta: isPreview ? "Click to view customer records" : "Based on recorded orders · View →",
      icon: Users,
      tint: "blue",
      href: "/admin/customers"
    },
    {
      label: isPreview ? "Sample average" : "Average order",
      value: formatCurrency(average),
      delta: isPreview ? "Click to view order analytics" : "Calculated from orders · View orders →",
      icon: ShoppingCart,
      tint: "green",
      href: "/admin/orders"
    },
  ];

  return <>
    {/* Fully Working & Interactive Dashboard Metric Cards */}
    <section className={styles.metrics}>
      {metricData.map(({ label, value, delta, icon: Icon, tint, href }) => (
        <Link
          href={href}
          key={label}
          className={styles.metricCard}
          style={{ textDecoration: "none", cursor: "pointer", display: "block" }}
          title={`Click to open ${label} workspace`}
        >
          <div className={styles.metricTop}>
            <span>{label}</span>
            <span className={`${styles.metricIcon} ${styles[tint]}`}>
              <Icon size={17} />
            </span>
          </div>
          <div className={styles.metricValue}>{value}</div>
          <div className={styles.metricFoot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{delta}</span>
            <ArrowUpRight size={13} color="#7451ba" />
          </div>
        </Link>
      ))}
    </section>

    <div className={styles.dashboardGrid}>
      <section className={`${styles.panel} ${styles.revenuePanel}`}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>{isPreview ? "SAMPLE ORDER DATA" : "ORDER RECORDS"}</span>
            <h2>Revenue by month</h2>
          </div>
          <Link href="/admin/reports" className={styles.dataSource} style={{ textDecoration: "none" }} title="Click to view detailed reports">
            <CalendarDays size={13} /> {isPreview ? "Preview sample" : "Last 6 months"} · View Reports →
          </Link>
        </div>
        <div className={styles.chartSummary}>
          <strong>{formatCurrency(revenue)}</strong>
          <span>{orders.length} orders</span>
        </div>
        <div className={styles.chart}>
          <div className={styles.chartLabels}>
            <span>{formatCurrency(maxRevenue)}</span>
            <span>{formatCurrency(maxRevenue * .75)}</span>
            <span>{formatCurrency(maxRevenue * .5)}</span>
            <span>{formatCurrency(maxRevenue * .25)}</span>
            <span>₹ 0</span>
          </div>
          <div className={styles.chartPlot}>
            <div className={styles.chartGuides}><i /><i /><i /><i /><i /></div>
            <div className={styles.liveBars}>
              {months.map((month) => {
                const barHeight = month.total ? Math.max(4, (month.total / maxRevenue) * 78) : 0;
                return (
                  <div className={styles.liveBarColumn} key={month.label} title={`${month.label}: ${formatCurrency(month.total)}`}>
                    <strong className={styles.liveBarValue} style={{ bottom: `calc(${barHeight}% + 4px)` }}>{formatCurrency(month.total)}</strong>
                    <span style={{ height: `${barHeight}%` }} />
                    <small>{month.label}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className={styles.chartNote}>
          <span className={styles.chartNoteDot} />
          <strong>{isPreview ? "Preview data" : "Recorded data"}</strong>
          <span>{isPreview ? "Sample amounts are shown for layout preview only; they are not real sales." : "Amounts are calculated from orders saved in this browser."}</span>
        </p>
      </section>

      <section className={`${styles.panel} ${styles.orderPanel}`} aria-labelledby="order-status-heading">
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>FULFILMENT</span>
            <h2 id="order-status-heading">Order status</h2>
          </div>
          <Link href="/admin/orders" className={styles.fulfillmentTotal} style={{ textDecoration: "none" }}>
            {totalOrders} total · Manage →
          </Link>
        </div>
        <div className={styles.fulfillmentSummary}>
          <div className={styles.fulfillmentSummaryText}>
            <span>Order distribution</span>
            <strong>{totalOrders ? `${totalOrders} orders` : "No orders yet"}</strong>
          </div>
          <div className={styles.fulfillmentTrack} role="img" aria-label={`${delivered} delivered, ${pending} in progress, ${shipped} shipped`}>
            <span className={styles.fulfillmentDelivered} style={{ width: `${totalOrders ? (delivered / totalOrders) * 100 : 0}%` }} />
            <span className={styles.fulfillmentPending} style={{ width: `${totalOrders ? (pending / totalOrders) * 100 : 0}%` }} />
            <span className={styles.fulfillmentShipped} style={{ width: `${totalOrders ? (shipped / totalOrders) * 100 : 0}%` }} />
          </div>
        </div>
        <div className={styles.fulfillmentList}>
          {fulfillmentStatuses.map(({ label, description, value, icon: Icon, className, href }) => (
            <Link href={href} className={styles.fulfillmentItem} key={label} style={{ textDecoration: "none", cursor: "pointer" }} title={`Click to view ${label} orders in Orders workspace`}>
              <span className={`${styles.fulfillmentIcon} ${className}`}><Icon size={16} /></span>
              <span className={styles.fulfillmentCopy}>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <strong className={styles.fulfillmentCount}>{value}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.recentPanel}`}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>{isPreview ? "SAMPLE RECORDS" : "LATEST RECORDS"}</span>
            <h2>Recent orders</h2>
          </div>
          <Link href="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            View orders <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th className={styles.alignRight}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (onSelectOrder) onSelectOrder(order);
                  }}
                  title="Click to view full order invoice & details"
                >
                  <td>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectOrder) onSelectOrder(order);
                      }}
                      style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
                    >
                      <strong className={styles.orderId} style={{ color: "#7652c8", textDecoration: "underline" }}>
                        {order.id}
                      </strong>
                    </button>
                  </td>
                  <td><span className={styles.customerName}>{order.customer}</span></td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className={styles.alignRight}><strong>{formatCurrency(order.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={`${styles.panel} ${styles.quickPanel}`}>
        <div className={styles.panelHeading}>
          <div><span className={styles.eyebrow}>QUICK ACCESS</span><h2>What would you like to do?</h2><p>Jump straight to a common workspace task.</p></div>
          <button type="button" className={styles.iconButton} aria-expanded={quickOpen} aria-controls="quick-action-menu" aria-label={quickOpen ? "Close quick actions" : "Open quick actions"} onClick={onQuick}><MoreHorizontal size={18} /></button>
        </div>
        <div className={styles.quickLinks}>
          <Link href="/admin/products/new" className={styles.quickLink}><span className={`${styles.quickIcon} ${styles.quickIconPurple}`}><Package size={17} /></span><span><strong>Add a product</strong><small>Create or update a catalog item</small></span><span className={styles.quickArrow}><ArrowUpRight size={15} /></span></Link>
          <Link href="/admin/inventory" className={styles.quickLink}><span className={`${styles.quickIcon} ${styles.quickPeach}`}><SlidersHorizontal size={17} /></span><span><strong>Review inventory</strong><small>{lowStock.length} low stock {lowStock.length === 1 ? "item" : "items"} to review</small></span><span className={styles.quickArrow}><ArrowUpRight size={15} /></span></Link>
          <Link href="/admin/content" className={styles.quickLink}><span className={`${styles.quickIcon} ${styles.quickBlue}`}><HeartHandshake size={17} /></span><span><strong>Update your story</strong><small>Edit the website introduction</small></span><span className={styles.quickArrow}><ArrowUpRight size={15} /></span></Link>
        </div>
        {quickOpen && <div id="quick-action-menu" className={styles.quickActionMenu}><span className={styles.quickMenuLabel}>MORE WORKSPACE ACTIONS</span><Link href="/admin/products/new"><Plus size={14} /> Create product</Link><Link href="/admin/orders"><Package size={14} /> Review orders</Link><Link href="/admin/reports"><Download size={14} /> View reports</Link></div>}
        {lowStock.length > 0 && <Link href="/admin/inventory" className={styles.impactNote}><span className={styles.impactIcon}><Sparkles size={16} /></span><span className={styles.impactCopy}><span className={styles.impactTitle}><strong>Stock needs review</strong><b>{lowStock.length} {lowStock.length === 1 ? "product" : "products"}</b></span><small title={lowStock.map((product) => product.name).join(", ")}>{lowStock.map((product) => product.name).slice(0, 2).join(", ")}{lowStock.length > 2 ? ` +${lowStock.length - 2} more` : ""}</small></span><span className={styles.impactAction}>Review <ArrowUpRight size={13} /></span></Link>}
      </section>
    </div>
  </>;
}
function ProductSection({
  allProducts,
  products,
  categories,
  search,
  onSearch,
  category,
  onCategory,
  status,
  onStatus,
  stock,
  onStock,
  sort,
  onSort,
  onEdit,
  onDelete
}: {
  allProducts: AdminProduct[];
  products: AdminProduct[];
  categories: AdminCategory[];
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  stock: string;
  onStock: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}) {
  const lowStockCount = allProducts.filter((item) => item.stock > 0 && item.stock < 10).length;
  const outOfStockCount = allProducts.filter((item) => item.stock === 0).length;
  const publishedCount = allProducts.filter((item) => item.status === "Published").length;

  return (
    <>
      <div className={styles.statStrip}>
        <div
          className={`${styles.statCardInteractive} ${stock === "All stock levels" && status === "All statuses" ? styles.statCardActive : ""}`}
          onClick={() => {
            onStock("All stock levels");
            onStatus("All statuses");
          }}
          title="Click to view all products"
        >
          <span>All Products</span>
          <strong>{allProducts.length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${status === "Published" && stock === "All stock levels" ? styles.statCardActive : ""}`}
          onClick={() => {
            onStatus(status === "Published" ? "All statuses" : "Published");
            onStock("All stock levels");
          }}
          title="Click to filter by Published products"
        >
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${stock === "Low stock" ? styles.statCardActive : ""}`}
          onClick={() => {
            onStock(stock === "Low stock" ? "All stock levels" : "Low stock");
          }}
          title="Click to filter products with Low Stock (1-9 units)"
        >
          <span>
            Low stock {stock === "Low stock" && <small style={{ color: "#b77126" }}>● Active</small>}
          </span>
          <strong className={styles.warningText}>{lowStockCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${stock === "Out of stock" ? styles.statCardActive : ""}`}
          onClick={() => {
            onStock(stock === "Out of stock" ? "All stock levels" : "Out of stock");
          }}
          title="Click to filter Out of Stock products (0 units)"
        >
          <span>
            Out of stock {stock === "Out of stock" && <small style={{ color: "#dc2626" }}>● Active</small>}
          </span>
          <strong className={outOfStockCount > 0 ? styles.dangerText : ""}>{outOfStockCount}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search product, collection or SKU..."
            />
          </div>
          <div className={styles.toolbarActions}>
            <select
              className={styles.filterSelect}
              value={category}
              onChange={(event) => onCategory(event.target.value)}
            >
              <option>All categories</option>
              {categories.map((item) => (
                <option key={item.slug}>{item.name}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={stock}
              onChange={(event) => onStock(event.target.value)}
            >
              <option>All stock levels</option>
              <option>Low stock</option>
              <option>Out of stock</option>
              <option>In stock</option>
            </select>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={(event) => onStatus(event.target.value)}
            >
              <option>All statuses</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
            <select
              className={styles.filterSelect}
              value={sort}
              onChange={(event) => onSort(event.target.value)}
            >
              <option value="name">Name</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="stock-low">Lowest stock</option>
            </select>
          </div>
        </div>

        {stock !== "All stock levels" && (
          <div style={{
            background: stock === "Out of stock" ? "#fef2f2" : "#fefce8",
            border: `1px solid ${stock === "Out of stock" ? "#fecaca" : "#fef08a"}`,
            borderRadius: "8px",
            padding: "8px 14px",
            marginBottom: "12px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: stock === "Out of stock" ? "#991b1b" : "#854d0e"
          }}>
            <span>
              Showing <strong>{products.length}</strong> {stock.toLowerCase()} products
            </span>
            <button
              type="button"
              onClick={() => onStock("All stock levels")}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px"
              }}
            >
              Reset filter ✕
            </button>
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>SKU</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.productCell}>
                      <span
                        className={`${styles.productThumb} ${styles[`thumb${index % 4}`]}`}
                        style={item.image ? { padding: 0, overflow: "hidden" } : undefined}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Package size={17} />
                        )}
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small className={styles.tableSub}>{item.slug}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div><strong>{item.category}</strong></div>
                    {item.subcategory && (
                      <small
                        style={{
                          color: "#806d89",
                          fontSize: "11px",
                          display: "inline-block",
                          background: "#f5f0f7",
                          padding: "1px 6px",
                          borderRadius: "8px",
                          marginTop: "2px"
                        }}
                      >
                        {item.subcategory}
                      </small>
                    )}
                  </td>
                  <td className={styles.sku}>{item.sku}</td>
                  <td><strong>{formatCurrency(item.price)}</strong></td>
                  <td>
                    <span
                      className={`${styles.stockValue} ${
                        item.stock === 0 ? styles.stockNone : item.stock < 10 ? styles.stockLow : ""
                      }`}
                    >
                      <i />
                      {item.stock === 0 ? "Out of stock (0)" : item.stock < 10 ? `Low: ${item.stock} left` : item.stock}
                    </span>
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        title="Edit Product"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => onDelete(item)}
                        aria-label={`Delete ${item.name}`}
                        title="Delete Product"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <EmptyState
              title="No matching products"
              body="Adjust your search or stock filters, or add a product."
            />
          )}
        </div>
        <div className={styles.tableFooter}>
          Showing <strong>{products.length}</strong> of <strong>{allProducts.length}</strong> products
        </div>
      </section>
    </>
  );
}

function InventorySection({
  allProducts,
  products,
  categories,
  search,
  onSearch,
  category,
  onCategory,
  stock,
  onStock,
  sort,
  onSort,
  advanced,
  onAdjust
}: {
  allProducts: AdminProduct[];
  products: AdminProduct[];
  categories: AdminCategory[];
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  stock: string;
  onStock: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  advanced: boolean;
  onAdjust: (id: string, amount: number) => void;
}) {
  const units = allProducts.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = allProducts.filter((item) => item.stock > 0 && item.stock < 10).length;
  const outOfStockCount = allProducts.filter((item) => item.stock === 0).length;

  return (
    <>
      <div className={styles.statStrip}>
        <div
          className={`${styles.statCardInteractive} ${stock === "All stock levels" ? styles.statCardActive : ""}`}
          onClick={() => onStock("All stock levels")}
          title="Click to view all inventory lines"
        >
          <span>Product lines</span>
          <strong>{allProducts.length}</strong>
        </div>

        <div>
          <span>Units in stock</span>
          <strong>{units}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${stock === "Low stock" ? styles.statCardActive : ""}`}
          onClick={() => onStock(stock === "Low stock" ? "All stock levels" : "Low stock")}
          title="Click to view items with Low Stock (< 10 units)"
        >
          <span>
            Low stock {stock === "Low stock" && <small style={{ color: "#b77126" }}>● Active</small>}
          </span>
          <strong className={styles.warningText}>{lowStockCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${stock === "Out of stock" ? styles.statCardActive : ""}`}
          onClick={() => onStock(stock === "Out of stock" ? "All stock levels" : "Out of stock")}
          title="Click to view Out of Stock items (0 units)"
        >
          <span>
            Out of stock {stock === "Out of stock" && <small style={{ color: "#dc2626" }}>● Active</small>}
          </span>
          <strong className={outOfStockCount > 0 ? styles.dangerText : ""}>{outOfStockCount}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search by product or SKU..."
            />
          </div>
          <div className={styles.toolbarActions}>
            <select
              className={styles.filterSelect}
              value={stock}
              onChange={(event) => onStock(event.target.value)}
            >
              <option>All stock levels</option>
              <option>Low stock</option>
              <option>Out of stock</option>
              <option>In stock</option>
            </select>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => exportProducts(products)}
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {stock !== "All stock levels" && (
          <div style={{
            background: stock === "Out of stock" ? "#fef2f2" : "#fefce8",
            border: `1px solid ${stock === "Out of stock" ? "#fecaca" : "#fef08a"}`,
            borderRadius: "8px",
            padding: "8px 14px",
            marginBottom: "12px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: stock === "Out of stock" ? "#991b1b" : "#854d0e"
          }}>
            <span>
              Showing <strong>{products.length}</strong> {stock.toLowerCase()} items
            </span>
            <button
              type="button"
              onClick={() => onStock("All stock levels")}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px"
              }}
            >
              Reset filter ✕
            </button>
          </div>
        )}

        {advanced && (
          <div className={styles.advancedFilters}>
            <div>
              <span className={styles.eyebrow}>FILTER INVENTORY</span>
              <p>Refine by collection and stock availability.</p>
            </div>
            <label>
              Collection
              <select
                className={styles.filterSelect}
                value={category}
                onChange={(event) => onCategory(event.target.value)}
              >
                <option>All categories</option>
                {categories.map((item) => (
                  <option key={item.slug}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select
                className={styles.filterSelect}
                value={sort}
                onChange={(event) => onSort(event.target.value)}
              >
                <option value="stock-low">Lowest stock first</option>
                <option value="name">Product name</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
            <button
              type="button"
              className={styles.clearFilters}
              onClick={() => {
                onCategory("All categories");
                onStock("All stock levels");
                onSort("stock-low");
                onSearch("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>SKU</th>
                <th>PRICE</th>
                <th>AVAILABLE</th>
                <th>ADJUST STOCK</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productThumb}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                          />
                        ) : (
                          <Package size={17} />
                        )}
                      </span>
                      <span>
                        <strong>{product.name}</strong>
                        <small className={styles.tableSub}>{product.status}</small>
                      </span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td className={styles.sku}>{product.sku}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span
                      className={`${styles.stockValue} ${
                        product.stock === 0 ? styles.stockNone : product.stock < 10 ? styles.stockLow : ""
                      }`}
                    >
                      <i />
                      {product.stock === 0 ? "Out of stock" : `${product.stock} units`}
                    </span>
                  </td>
                  <td>
                    <div className={styles.stockAdjust}>
                      <button
                        type="button"
                        onClick={() => onAdjust(product.id, -1)}
                        aria-label={`Remove one ${product.name}`}
                        disabled={product.stock === 0}
                      >
                        −
                      </button>
                      <strong>{product.stock}</strong>
                      <button
                        type="button"
                        onClick={() => onAdjust(product.id, 1)}
                        aria-label={`Add one ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <EmptyState
              title="No matching products"
              body="Change your filters to see inventory."
            />
          )}
        </div>
      </section>
    </>
  );
}

function OrdersSection({
  orders,
  isPreview,
  search,
  onSearch,
  status,
  onStatusFilter,
  onStatus,
  onDeleteOrder,
  onExport,
  onSelectOrder,
}: {
  orders: AdminOrder[];
  isPreview: boolean;
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatusFilter: (value: string) => void;
  onStatus: (id: string, status: AdminOrder["status"]) => void;
  onDeleteOrder?: (id: string) => void;
  onExport: () => void;
  onSelectOrder: (order: AdminOrder) => void;
}) {
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const processingCount = orders.filter((o) => o.status === "Processing").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <>
      {/* Interactive Metric Filter Cards - All 5 cards evenly aligned in single top row */}
      <div className={`${styles.statStrip} ${styles.statStrip5}`}>
        <div
          className={`${styles.statCardInteractive} ${status === "All statuses" ? styles.statCardActive : ""}`}
          onClick={() => onStatusFilter("All statuses")}
          title="Click to view all orders"
        >
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${status === "Pending" ? styles.statCardActive : ""}`}
          onClick={() => onStatusFilter(status === "Pending" ? "All statuses" : "Pending")}
          title="Click to filter Pending orders"
        >
          <span>Pending {status === "Pending" && <small style={{ color: "#d97706" }}>● Active</small>}</span>
          <strong style={{ color: "#d97706" }}>{pendingCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${status === "Processing" ? styles.statCardActive : ""}`}
          onClick={() => onStatusFilter(status === "Processing" ? "All statuses" : "Processing")}
          title="Click to filter Processing / Packing orders"
        >
          <span>Processing {status === "Processing" && <small style={{ color: "#7451ba" }}>● Active</small>}</span>
          <strong style={{ color: "#7451ba" }}>{processingCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${status === "Shipped" ? styles.statCardActive : ""}`}
          onClick={() => onStatusFilter(status === "Shipped" ? "All statuses" : "Shipped")}
          title="Click to filter Shipped orders"
        >
          <span>Shipped {status === "Shipped" && <small style={{ color: "#2563eb" }}>● Active</small>}</span>
          <strong style={{ color: "#2563eb" }}>{shippedCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${status === "Delivered" ? styles.statCardActive : ""}`}
          onClick={() => onStatusFilter(status === "Delivered" ? "All statuses" : "Delivered")}
          title="Click to filter Delivered orders"
        >
          <span>Delivered {status === "Delivered" && <small style={{ color: "#166534" }}>● Active</small>}</span>
          <strong style={{ color: "#166534" }}>{deliveredCount}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.tableToolbar}>
          <div className={styles.tableSearch}>
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search by order ID, customer name, phone, or address..."
            />
          </div>
          <div className={styles.toolbarActions}>
            <select
              className={styles.filterSelect}
              value={status}
              onChange={(event) => onStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
            {status !== "All statuses" && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => onStatusFilter("All statuses")}
                style={{ fontSize: "12px", padding: "6px 10px" }}
              >
                Clear ✕
              </button>
            )}
            <button type="button" className={styles.secondaryButton} onClick={onExport}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER &amp; DELIVERY</th>
                <th>ORDERED ITEMS</th>
                <th>DATE</th>
                <th>PAYMENT</th>
                <th>DISPATCH STATUS</th>
                <th className={styles.alignRight}>TOTAL</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemsCount = Array.isArray(order.items)
                  ? order.items.reduce((acc, it) => acc + (it.quantity || 1), 0)
                  : 1;

                return (
                  <tr
                    key={order.id}
                    onClick={(e) => {
                      const tag = (e.target as HTMLElement).tagName.toLowerCase();
                      if (tag !== "select" && tag !== "option" && tag !== "button" && tag !== "a") {
                        onSelectOrder(order);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                    title="Click row to view full order invoice & customer address"
                  >
                    <td>
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
                      >
                        <strong className={styles.orderId} style={{ color: "#59368d", textDecoration: "underline", fontSize: "13.5px" }}>
                          {order.id}
                        </strong>
                      </button>
                    </td>
                    <td>
                      <span className={styles.customerName}>{order.customer}</span>
                      {order.customerPhone && (
                        <div style={{ fontSize: "11px", color: "#8a7e93", marginTop: "1px" }}>
                          📞 {order.customerPhone}
                        </div>
                      )}
                      {order.customerAddress && (
                        <small className={styles.tableSub} style={{ maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                          📍 {order.customerAddress}
                        </small>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "12.5px", color: "#372744", fontWeight: "600" }}>
                        {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                      </div>
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <div style={{ fontSize: "11px", color: "#746982", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {order.items.map((it) => it.name).join(", ")}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "12px", color: "#6a5f78", whiteSpace: "nowrap" }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: order.paymentMethod?.toLowerCase().includes("cash") ? "#fef3c7" : "#eef8f2",
                          color: order.paymentMethod?.toLowerCase().includes("cash") ? "#92400e" : "#166534",
                        }}
                      >
                        {order.paymentMethod || "UPI"}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`${styles.statusSelect} ${styles[`status${order.status}`]}`}
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(event) => onStatus(order.id, event.target.value as AdminOrder["status"])}
                        aria-label={`Status for ${order.id}`}
                        style={{ fontWeight: "700" }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className={styles.alignRight}>
                      <strong style={{ fontSize: "14px", color: "#166534" }}>{formatCurrency(order.total)}</strong>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOrder(order);
                          }}
                          title="View order invoice & details"
                          style={{ fontSize: "11.5px", padding: "5px 9px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Eye size={13} /> Invoice
                        </button>
                        {onDeleteOrder && (
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteOrder(order.id);
                            }}
                            title="Delete this order"
                            style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fee2e2", padding: "5px 7px" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <EmptyState title="No matching orders" body="Change the search or status filter to see orders." />
          )}
        </div>
      </section>
    </>
  );
}
function CustomersSection({ orders, isPreview, search, onSearch }: { orders: AdminOrder[]; isPreview: boolean; search: string; onSearch: (value: string) => void }) {
  const rows = useMemo(() => {
    const grouped = new Map<string, { name: string; count: number; total: number; firstDate: string }>();
    orders.forEach((order) => { const key = order.customer.trim().toLowerCase(); if (!key) return; const current = grouped.get(key); if (current) { current.count += 1; current.total += order.total; if (order.createdAt < current.firstDate) current.firstDate = order.createdAt; } else grouped.set(key, { name: order.customer, count: 1, total: order.total, firstDate: order.createdAt }); });
    return [...grouped.values()].filter((customer) => customer.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.total - a.total);
  }, [orders, search]);
  return <section className={styles.panel}><div className={styles.tableToolbar}><div className={styles.tableSearch}><Search size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search customer name..." /></div><span className={styles.statusPill}>{isPreview ? "Sample data · " : ""}{rows.length} customers</span></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>CUSTOMER</th><th>{isPreview ? "SAMPLE ORDERS" : "RECORDED ORDERS"}</th><th>ORDER TOTAL</th><th>FIRST ORDER</th></tr></thead><tbody>{rows.map((customer) => <tr key={customer.name}><td><div className={styles.productCell}><span className={styles.avatar}>{customer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span><strong>{customer.name}</strong><small className={styles.tableSub}>{isPreview ? "Example customer · no contact details" : "Contact details were not included with the order record"}</small></span></div></td><td>{customer.count}</td><td><strong>{formatCurrency(customer.total)}</strong></td><td>{formatDate(customer.firstDate)}</td></tr>)}</tbody></table></div>{rows.length === 0 && <EmptyState title="No matching customers" body="Change your search to see customer records." />}</section>;
}

function CategoriesSection({ categories, products, onEdit, onDelete }: { categories: AdminCategory[]; products: AdminProduct[]; onEdit: (category: AdminCategory) => void; onDelete: (category: AdminCategory) => void }) {
  return categories.length ? <div className={styles.categoryGrid}>{categories.map((category, index) => {
    const subs = Array.isArray(category.subcategories) ? category.subcategories : (category.subcategories ? String(category.subcategories).split(",").map((s) => s.trim()).filter(Boolean) : []);
    return <article className={styles.categoryCard} key={category.slug}>
      <div className={`${styles.categoryArt} ${styles[`categoryArt${index % 3}`]}`}>
        <span>0{index + 1}</span>
        <Shapes size={32} strokeWidth={1.2} />
      </div>
      <div className={styles.categoryInfo}>
        <div>
          <span className={styles.statusPill}><i /> Available</span>
          <button type="button" className={styles.iconButton} aria-label={`Delete ${category.name}`} onClick={() => onDelete(category)}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>{category.name}</h2>
          <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "99px", fontWeight: 600 }}>
            GST: {category.gstRate !== undefined ? `${category.gstRate}%` : "12%"} {category.hsnCode ? `(HSN: ${category.hsnCode})` : ""}
          </span>
        </div>
        <p>{category.description}</p>
        {subs.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "10px 0" }}>
            {subs.map((sub) => (
              <span key={sub} style={{ fontSize: "11px", background: "rgba(128, 109, 137, 0.12)", color: "#54435b", padding: "3px 8px", borderRadius: "12px", fontWeight: 500 }}>
                {sub}
              </span>
            ))}
          </div>
        )}
        <footer>
          <span>{products.filter((product) => product.category === category.name).length} products</span>
          <button type="button" onClick={() => onEdit(category)}>Edit collection <ArrowUpRight size={14} /></button>
        </footer>
      </div>
    </article>;
  })}</div> : <EmptyState title="No collections yet" body="Add a collection to organize products." />;
}

function ReportsSection({ products, orders }: { products: AdminProduct[]; orders: AdminOrder[] }) {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const units = products.reduce((sum, product) => sum + product.stock, 0);
  const months = monthSeries(orders);
  const max = Math.max(1, ...months.map((month) => month.total));

  // Category revenue / product count breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; totalStock: number }>();
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      const existing = map.get(cat) || { count: 0, totalStock: 0 };
      map.set(cat, { count: existing.count + 1, totalStock: existing.totalStock + p.stock });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [products]);

  // Payment method breakdown
  const paymentStats = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const m = o.paymentMethod || "UPI";
      map.set(m, (map.get(m) || 0) + o.total);
    });
    return Array.from(map.entries());
  }, [orders]);

  return <>
    <div className={styles.reportToolbar}>
      <span><CalendarDays size={15} /> Live Analytics · Synced with Strapi Backend &amp; Local Orders</span>
      <button className={styles.secondaryButton} type="button" onClick={() => exportOrders(orders)}>
        <Download size={15} /> Export Report CSV
      </button>
    </div>

    <div className={styles.metrics}>
      {[
        { label: "Total Revenue", value: formatCurrency(revenue), icon: TrendingUp, tint: "purple" },
        { label: "Total Orders", value: String(orders.length), icon: ShoppingCart, tint: "peach" },
        { label: "Active Products", value: String(products.length), icon: Package, tint: "blue" },
        { label: "Total Stock Units", value: String(units), icon: Users, tint: "green" }
      ].map(({ label, value, icon: Icon, tint }) => (
        <article className={styles.metricCard} key={label}>
          <div className={styles.metricTop}>
            <span>{label}</span>
            <span className={`${styles.metricIcon} ${styles[tint]}`}><Icon size={17} /></span>
          </div>
          <div className={styles.metricValue}>{value}</div>
          <div className={styles.metricFoot}>Live Store Performance</div>
        </article>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", marginBottom: "16px" }}>
      <section className={`${styles.panel} ${styles.reportChartPanel}`}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>MONTHLY TRENDS</span>
            <h2>Revenue by Month</h2>
          </div>
        </div>
        <div className={styles.reportBars}>
          {months.map((month) => (
            <div key={month.label} title={`${month.label}: ${formatCurrency(month.total)}`}>
              <span style={{ height: `${month.total ? Math.max(8, (month.total / max) * 100) : 4}%` }} />
              <small>{month.label}</small>
            </div>
          ))}
        </div>
        {orders.length === 0 && <p className={styles.noRecords}>The chart will reflect new live orders as they are received.</p>}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>CATALOG DISTRIBUTION</span>
            <h2>Top Collections</h2>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {categoryStats.slice(0, 5).map(([name, stat]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#fbf9fd", borderRadius: "8px", border: "1px solid #f0edf4" }}>
              <div>
                <strong style={{ fontSize: "11px", color: "#3d324b" }}>{name}</strong>
                <div style={{ fontSize: "9px", color: "#8a8197" }}>{stat.totalStock} units available</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#7652c8", background: "#f2edfa", padding: "2px 8px", borderRadius: "12px" }}>
                {stat.count} items
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>

    {paymentStats.length > 0 && (
      <section className={styles.panel} style={{ marginBottom: "16px" }}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>PAYMENTS BREAKDOWN</span>
            <h2>Revenue by Payment Method</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "14px" }}>
          {paymentStats.map(([method, total]) => (
            <div key={method} style={{ flex: "1 1 180px", padding: "12px 14px", border: "1px solid #eeeaf2", borderRadius: "9px", background: "#fff" }}>
              <span style={{ fontSize: "9px", color: "#8a8197", textTransform: "uppercase", fontWeight: 700 }}>{method}</span>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#238768", marginTop: "4px" }}>{formatCurrency(total)}</div>
            </div>
          ))}
        </div>
      </section>
    )}
  </>;
}

function ContentSection({ title, description, onTitle, onDescription, onSubmit }: { title: string; description: string; onTitle: (value: string) => void; onDescription: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className={styles.contentEditorGrid}><section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>HOMEPAGE</span><h2>Hero section</h2></div></div><form className={styles.editorForm} onSubmit={onSubmit}><label>Headline<input value={title} onChange={(event) => onTitle(event.target.value)} required /></label><label>Supporting text<textarea rows={4} value={description} onChange={(event) => onDescription(event.target.value)} required /></label><div className={styles.modalActions}><button className={styles.primaryButton} type="submit">Save content <Check size={15} /></button></div></form></section><aside className={styles.previewCard}><span className={styles.eyebrow}>CONTENT PREVIEW</span><div className={styles.previewHero}><span>SWACHETNA FOUNDATION</span><h2>{title}</h2><p>{description}</p><span className={styles.previewAction}>Explore our work <ArrowUpRight size={13} /></span></div><div className={styles.previewFoot}><span><i /> Updated in this browser</span></div></aside></div>;
}

function CampaignSection({ campaigns, name, onName, area, onArea, status, onStatus, onSubmit, onDelete, onUpdate }: { campaigns: AdminCampaign[]; name: string; onName: (value: string) => void; area: string; onArea: (value: string) => void; status: AdminCampaign["status"]; onStatus: (value: AdminCampaign["status"]) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDelete: (id: string) => void; onUpdate: (id: string, status: AdminCampaign["status"]) => void }) {
  return <><section className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>FOUNDATION PROGRAMS</span><h2>Your initiatives</h2></div><span className={styles.statusPill}>{campaigns.length} programs</span></div>{campaigns.length ? <div className={styles.programList}>{campaigns.map((campaign) => <article className={styles.programRow} key={campaign.id}><span className={styles.programThumb}><HeartHandshake size={20} /></span><div><span className={styles.programTag}>{campaign.area}</span><h3>{campaign.name}</h3></div><select className={styles.filterSelect} value={campaign.status} onChange={(event) => onUpdate(campaign.id, event.target.value as AdminCampaign["status"])} aria-label={`Status of ${campaign.name}`}><option>Active</option><option>Draft</option></select><button type="button" className={styles.iconButton} aria-label={`Remove ${campaign.name}`} onClick={() => onDelete(campaign.id)}><X size={16} /></button></article>)}</div> : <EmptyState title="No programs added" body="Add a foundation initiative below to keep it in this workspace." />}</section><section id="new-program" className={styles.panel}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>CREATE</span><h2>New community program</h2></div></div><form className={styles.inlineForm} onSubmit={onSubmit}><label>Program name<input value={name} onChange={(event) => onName(event.target.value)} placeholder="Name of initiative" required /></label><label>Program area<select value={area} onChange={(event) => onArea(event.target.value)}><option>Community wellbeing</option><option>Education</option><option>Health</option><option>Skills &amp; livelihoods</option><option>Food security</option></select></label><label>Status<select value={status} onChange={(event) => onStatus(event.target.value as AdminCampaign["status"])}><option>Active</option><option>Draft</option></select></label><button className={styles.primaryButton} type="submit"><Plus size={15} /> Save program</button></form></section></>;
}

function SettingsSection({ value, onChange, onSubmit }: { value: { organization: string; email: string; phone: string; website: string; address: string }; onChange: (value: { organization: string; email: string; phone: string; website: string; address: string }) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const update = (key: keyof typeof value, field: string) => onChange({ ...value, [key]: field });
  return <div className={styles.settingsGrid}>
    <aside className={styles.settingsAside}>
      <span className={styles.settingsBrandIcon}><HeartHandshake size={22} /></span>
      <span className={styles.eyebrow}>FOUNDATION PROFILE</span>
      <h2>{value.organization || "Your organization"}</h2>
      <p>{value.website || "Add your website address"}</p>
      <div className={styles.settingsStatus}><i /> Workspace profile</div>
      <div className={styles.settingsAsideFoot}><strong>Saved in this browser</strong><small>These details are local to this device and are not published to the website.</small></div>
    </aside>
    <section className={`${styles.panel} ${styles.settingsPanel}`}>
      <div className={styles.panelHeading}><div><span className={styles.eyebrow}>ORGANIZATION</span><h2>Profile details</h2><p>Keep your contact information current for this workspace.</p></div><span className={styles.settingsBadge}>LOCAL PROFILE</span></div>
      <form className={styles.settingsForm} onSubmit={onSubmit}>
        <div className={styles.formRow}><label>Organization name<input autoComplete="organization" value={value.organization} onChange={(event) => update("organization", event.target.value)} required /></label><label>Contact email<input autoComplete="email" type="email" value={value.email} onChange={(event) => update("email", event.target.value)} /></label></div>
        <div className={styles.formRow}><label>Phone number<input autoComplete="tel" type="tel" value={value.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Website<input type="url" value={value.website} onChange={(event) => update("website", event.target.value)} placeholder="https://example.org" /></label></div>
        <label>Address<textarea autoComplete="street-address" rows={3} value={value.address} onChange={(event) => update("address", event.target.value)} /></label>
        <div className={styles.settingsSaveRow}><span><Check size={14} /> Saved only after you press Save</span><button type="submit" className={styles.primaryButton}>Save organization details <Check size={15} /></button></div>
      </form>
    </section>
  </div>;
}
function ProductDialog({ product, categories, onClose, onSave, returnToProducts }: { product: AdminProduct | null; categories: AdminCategory[]; onClose: () => void; onSave: (product: Omit<AdminProduct, "id" | "slug"> & { id?: string; slug?: string }) => Promise<boolean> | boolean; returnToProducts: boolean }) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? categories[0]?.name ?? "Uncategorized");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [gstRate, setGstRate] = useState<string>(product?.gstRate !== undefined ? String(product.gstRate) : "");
  const [hsnCode, setHsnCode] = useState<string>(product?.hsnCode || "");
  const [status, setStatus] = useState<AdminProduct["status"]>(product?.status ?? "Published");
  const [image, setImage] = useState(product?.image ?? "");
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    const rawImgs = product?.images as any;
    if (Array.isArray(rawImgs)) return rawImgs.filter(Boolean);
    if (typeof rawImgs === "string" && rawImgs.trim()) {
      return rawImgs.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
    }
    return product?.image ? [product.image] : [];
  });
  const [colorsText, setColorsText] = useState(Array.isArray(product?.colors) ? product.colors.join(", ") : "");
  const [sizesText, setSizesText] = useState(Array.isArray(product?.sizes) ? product.sizes.join(", ") : "");
  const [sizePrices, setSizePrices] = useState<Record<string, number>>(product?.sizePrices || {});
  const [variantsList, setVariantsList] = useState<Array<{ name: string; hex: string; images: string[]; price?: number; sizePrices?: Record<string, number> }>>(() => {
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      return product.variants.map((v) => ({
        name: v.name || "",
        hex: v.hex || "#7451ba",
        images: Array.isArray(v.images) ? v.images : [],
        price: v.price,
        sizePrices: (v as any).sizePrices || undefined
      }));
    }
    return [];
  });
  const [activeVariantTab, setActiveVariantTab] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if product changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setCategory(product.category || categories[0]?.name || "Uncategorized");
      setSubcategory(product.subcategory || "");
      setSku(product.sku || "");
      setPrice(product.price !== undefined ? String(product.price) : "");
      setStock(product.stock !== undefined ? String(product.stock) : "");
      setGstRate(product.gstRate !== undefined ? String(product.gstRate) : "");
      setHsnCode(product.hsnCode || "");
      setStatus(product.status || "Published");
      setImage(product.image || "");
      const rawImgs = product.images as any;
      const imgs = Array.isArray(rawImgs)
        ? rawImgs.filter(Boolean)
        : (typeof rawImgs === "string" && rawImgs.trim()
            ? rawImgs.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean)
            : (product.image ? [product.image] : []));
      setGalleryImages(imgs);
      setColorsText(Array.isArray(product.colors) ? product.colors.join(", ") : (product.colors || ""));
      setSizesText(Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.sizes || ""));
      setSizePrices(product.sizePrices || {});
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        setVariantsList(product.variants.map((v) => ({
          name: v.name || "",
          hex: v.hex || "#7451ba",
          images: Array.isArray(v.images) ? v.images : [],
          price: v.price,
          sizePrices: (v as any).sizePrices || undefined
        })));
      } else {
        setVariantsList([]);
      }
    } else {
      setName("");
      setDescription("");
      setCategory(categories[0]?.name || "Uncategorized");
      setSubcategory("");
      setSku("");
      setPrice("");
      setStock("");
      setGstRate("");
      setHsnCode("");
      setStatus("Published");
      setImage("");
      setGalleryImages([]);
      setColorsText("");
      setSizesText("");
      setSizePrices({});
      setVariantsList([]);
    }
  }, [product, categories]);

  const activeCategoryObj = categories.find((c) => c.name === category);
  const availableSubcategories: string[] = useMemo(() => {
    if (!activeCategoryObj?.subcategories) return [];
    if (Array.isArray(activeCategoryObj.subcategories)) return activeCategoryObj.subcategories;
    return String(activeCategoryObj.subcategories).split(",").map((s) => s.trim()).filter(Boolean);
  }, [activeCategoryObj]);

  const [isUploading, setIsUploading] = useState(false);

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError("");
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.urls) && data.urls.length > 0) {
        setGalleryImages((prev) => {
          const combined = [...prev, ...data.urls];
          return Array.from(new Set(combined));
        });
        if (!image) {
          setImage(data.urls[0]);
        }
      } else if (res.ok && data.url) {
        setGalleryImages((prev) => Array.from(new Set([...prev, data.url])));
        if (!image) setImage(data.url);
      }
    } catch (err: any) {
      setError("Failed to upload images. Please check file size.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (image === prev[indexToRemove]) {
        setImage(next[0] || "");
      }
      return next;
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedSku = sku.trim() || `SW-${Date.now().toString().slice(-6)}`;
    if (!normalizedName || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      setError("Add a product name, a valid price, and a whole-number stock quantity.");
      return;
    }
    const colors = colorsText.split(",").map((c) => c.trim()).filter(Boolean);
    const sizes = sizesText.split(",").map((s) => s.trim()).filter(Boolean);
    
    // Ensure gallery images list has main image at front
    const images = [...galleryImages];
    if (image && !images.includes(image)) {
      images.unshift(image);
    }
    const mainImg = image || images[0] || "";

    // Sync variants: if variantsList has items, use it. Otherwise, create a default from colors
    const variantsToSave = variantsList.length > 0 ? variantsList : (
      colors.map((c) => ({
        name: c,
        hex: "#7451ba",
        images: images.length > 0 ? images : [mainImg]
      }))
    );

    try {
      setIsSubmitting(true);
      const saved = await onSave({
        id: product?.id,
        slug: product?.slug,
        name: normalizedName,
        description: description.trim(),
        category,
        subcategory,
        sku: normalizedSku,
        price: Number(price),
        stock: Number(stock),
        status,
        gstRate: gstRate !== "" ? Number(gstRate) : (activeCategoryObj?.gstRate !== undefined ? activeCategoryObj.gstRate : 12),
        hsnCode: hsnCode.trim() || activeCategoryObj?.hsnCode || "",
        image: mainImg,
        images,
        colors,
        sizes,
        sizePrices,
        variants: variantsToSave,
        reviews: product?.reviews || []
      });
      if (!saved) setError("This SKU is already in use. Choose a different SKU.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const closeControl = (className: string, label: string, child: ReactNode) => returnToProducts
    ? <Link href="/admin/products" className={className} aria-label={label}>{child}</Link>
    : <button type="button" className={className} onClick={onClose} aria-label={label}>{child}</button>;
  return <div className={styles.modalScrim} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section id="product-dialog" className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title"><div className={styles.modalHead}><div><span className={styles.eyebrow}>PRODUCT CATALOG</span><h2 id="product-dialog-title">{product ? "Edit product" : "Add product"}</h2><p>Add the product details, description, image, price and available quantity.</p></div>{closeControl(styles.iconButton, "Close product form", <X size={18} />)}</div><form className={styles.modalForm} onSubmit={submit}>
    <label>Product name<input autoFocus autoComplete="off" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Handcrafted Mango Pickle / Dryfruit Laddu" required maxLength={100} /></label>
    <label>Product description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the product, ingredients, materials or what makes it special..." maxLength={1200} /></label>
    
    {/* Nykaa Style Multi-Angle Gallery Uploader */}
    <div style={{ padding: "14px", background: "#fbf9fd", border: "1.5px dashed #cfbfe3", borderRadius: "10px", marginTop: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div>
          <strong style={{ fontSize: "12px", color: "#3c2a55", display: "block" }}>Product Photos &amp; Angle Gallery</strong>
          <span style={{ fontSize: "11px", color: "#77638d" }}>Add multiple photos (Front view, Side angle, Texture/Ingredient close-up, Packaging)</span>
        </div>
        <label style={{
          cursor: isUploading ? "not-allowed" : "pointer",
          padding: "6px 12px",
          background: "linear-gradient(135deg, #7451ba 0%, #5e3b9f 100%)",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 2px 6px rgba(116,81,186,0.25)"
        }}>
          <Upload size={14} />
          {isUploading ? "Uploading..." : "Select Images (Multiple)"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleFilesUpload}
            disabled={isUploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Gallery Thumbnails List */}
      {galleryImages.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
          {galleryImages.map((imgUrl, idx) => {
            const isMain = image === imgUrl || (!image && idx === 0);
            return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: "74px",
                  height: "74px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: isMain ? "2px solid #7451ba" : "1px solid #d9d0e5",
                  background: "#fff",
                  boxShadow: isMain ? "0 0 0 2px rgba(116,81,186,0.2)" : "none"
                }}
              >
                <img src={imgUrl} alt={`Angle ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                {/* Main badge */}
                {isMain && (
                  <span style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(116,81,186,0.9)",
                    color: "#fff",
                    fontSize: "8px",
                    textAlign: "center",
                    fontWeight: 700,
                    padding: "1px 0"
                  }}>
                    COVER
                  </span>
                )}

                {/* Make Main button */}
                {!isMain && (
                  <button
                    type="button"
                    onClick={() => setImage(imgUrl)}
                    title="Set as main cover photo"
                    style={{
                      position: "absolute",
                      bottom: 2,
                      left: 2,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      fontSize: "7px",
                      padding: "1px 4px",
                      cursor: "pointer"
                    }}
                  >
                    Set Main
                  </button>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  title="Remove this photo"
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    background: "rgba(220,38,38,0.85)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    fontSize: "9px",
                    lineHeight: 1
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "16px 8px", color: "#8a75a0", fontSize: "11px" }}>
          No photos added yet. Click &ldquo;Select Images (Multiple)&rdquo; or paste an image URL below.
        </div>
      )}

      {/* URL Input Fallback */}
      <div style={{ display: "flex", gap: "6px", marginTop: "10px", alignItems: "center" }}>
        <input
          value={image}
          onChange={(e) => {
            const val = e.target.value.trim();
            setImage(val);
            if (val && !galleryImages.includes(val)) {
              setGalleryImages((prev) => [...prev, val]);
            }
          }}
          placeholder="Or paste an image URL here..."
          style={{ flex: 1, height: "28px", fontSize: "11px", padding: "0 8px", border: "1px solid #d9d0e5", borderRadius: "6px" }}
        />
        {image && !galleryImages.includes(image) && (
          <button
            type="button"
            onClick={() => setGalleryImages((prev) => [...prev, image])}
            style={{ padding: "0 10px", height: "28px", background: "#f0ebf8", border: "1px solid #cfbfe3", color: "#7451ba", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
          >
            Add URL
          </button>
        )}
      </div>
    </div>

    <div className={styles.formRow}>
      <label>Main Collection<select value={category} onChange={(event) => { setCategory(event.target.value); setSubcategory(""); }}>{categories.length ? categories.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>) : <option>Uncategorized</option>}</select></label>
      <label>
        Sub-collection
        <small className={styles.formHint} style={{ marginLeft: "6px" }}>(Select from list or type custom)</small>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          {availableSubcategories.length > 0 && (
            <select
              value={availableSubcategories.includes(subcategory) ? subcategory : ""}
              onChange={(event) => {
                if (event.target.value) {
                  setSubcategory(event.target.value);
                }
              }}
              style={{ flex: 1, minWidth: "140px" }}
            >
              <option value="">-- Choose existing --</option>
              {availableSubcategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}
          <input
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
            placeholder="e.g. Dryfruit Laddus, Traditional Pickles"
            maxLength={80}
            style={{ flex: 1 }}
          />
        </div>
      </label>
    </div>
    <div className={styles.formRow}><label>Price (INR)<input inputMode="decimal" min="0" step="0.01" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0.00" required /></label><label>Stock quantity<input inputMode="numeric" min="0" step="1" type="number" value={stock} onChange={(event) => setStock(event.target.value)} placeholder="0" required /></label></div>
    <div className={styles.formRow}>
      <label>
        GST Tax Rate (%)
        <select value={gstRate} onChange={(e) => setGstRate(e.target.value)}>
          <option value="">Default from Collection ({activeCategoryObj?.gstRate !== undefined ? `${activeCategoryObj.gstRate}%` : "12%"})</option>
          <option value="0">0% (Nil / Exempt)</option>
          <option value="5">5% GST (Food, Grains, Bags)</option>
          <option value="12">12% GST (Pottery, Textiles)</option>
          <option value="18">18% GST (Ceramics, Crafts)</option>
          <option value="28">28% GST</option>
        </select>
      </label>
      <label>
        HSN Code
        <input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder={activeCategoryObj?.hsnCode ? `Default: ${activeCategoryObj.hsnCode}` : "e.g. 2106, 6305"} maxLength={10} />
      </label>
    </div>
    {/* Dynamic Variant Field Name based on Category */}
    <div className={styles.formRow}>
      <label>
        {category.toLowerCase().includes("food") || subcategory.toLowerCase().includes("pickle") || name.toLowerCase().includes("pickle") || name.toLowerCase().includes("laddu")
          ? "Varieties / Flavors / Recipes"
          : subcategory.toLowerCase().includes("bag") || name.toLowerCase().includes("bag") || name.toLowerCase().includes("tote")
          ? "Colors / Patterns (e.g. Natural Jute, Indigo Blue, Black Striped)"
          : subcategory.toLowerCase().includes("pottery") || name.toLowerCase().includes("vase") || name.toLowerCase().includes("diya")
          ? "Clay Finishes / Materials (e.g. Terracotta Red, Matte Ochre, Antique Brass)"
          : "Colors / Variations"}
        <small className={styles.formHint}> (Comma separated list)</small>
        <input
          value={colorsText}
          onChange={(e) => {
            const val = e.target.value;
            setColorsText(val);
            // Auto update or seed shades
            const shades = val.split(",").map((s) => s.trim()).filter(Boolean);
            if (shades.length > 0) {
              setVariantsList((prev) => {
                return shades.map((sName) => {
                  const existing = prev.find((p) => p.name.toLowerCase() === sName.toLowerCase());
                  return existing || {
                    name: sName,
                    hex: sName.toLowerCase().includes("red") ? "#b84534"
                      : sName.toLowerCase().includes("pink") || sName.toLowerCase().includes("blush") ? "#ea5d86"
                      : sName.toLowerCase().includes("coral") || sName.toLowerCase().includes("orange") ? "#f97316"
                      : sName.toLowerCase().includes("black") ? "#262626"
                      : sName.toLowerCase().includes("blue") || sName.toLowerCase().includes("indigo") ? "#295f98"
                      : sName.toLowerCase().includes("yellow") || sName.toLowerCase().includes("ochre") || sName.toLowerCase().includes("lemon") ? "#d49a37"
                      : sName.toLowerCase().includes("green") || sName.toLowerCase().includes("chilli") ? "#2e7d32"
                      : sName.toLowerCase().includes("gold") || sName.toLowerCase().includes("jute") ? "#c29958"
                      : "#8b5e3c",
                    images: galleryImages.length > 0 ? [...galleryImages] : []
                  };
                });
              });
            }
          }}
          placeholder={
            category.toLowerCase().includes("food")
              ? "Raw Mango, Spicy Lemon, Garlic Infused"
              : subcategory.toLowerCase().includes("bag")
              ? "Natural Golden Jute, Indigo Blue, Charcoal Black"
              : "Terracotta Red, Ochre Yellow, Clay Brown"
          }
          maxLength={200}
        />
      </label>
      <label>
        {category.toLowerCase().includes("food")
          ? "Package Weights / Sizes (e.g. 250g Jar, 500g Jar, 1kg)"
          : subcategory.toLowerCase().includes("bag")
          ? "Bag Sizes / Capacity (e.g. Standard Tote, Large Market Tote)"
          : "Sizes / Dimensions (e.g. Small, Medium, Large)"}
        <small className={styles.formHint}> (Comma separated)</small>
        <input
          value={sizesText}
          onChange={(e) => setSizesText(e.target.value)}
          placeholder={category.toLowerCase().includes("food") ? "250g Jar, 500g Jar, 1kg Family Pack" : "Standard, Large"}
          maxLength={150}
        />
      </label>
    </div>

    {/* Dynamic Price-per-Weight/Size Manager for Admin */}
    {sizesText.split(",").map((s) => s.trim()).filter(Boolean).length > 0 && (
      <div style={{ padding: "12px 14px", background: "#fbf9fc", border: "1.5px dashed #cfbdd8", borderRadius: "8px", margin: "10px 0" }}>
        <strong style={{ fontSize: "12px", color: "#5d3570", display: "block", marginBottom: "4px" }}>
          ⚖️ Set Price for Each Package Weight / Size (Optional)
        </strong>
        <span style={{ fontSize: "11px", color: "#77638d", display: "block", marginBottom: "10px" }}>
          When user selects a weight or size, price on store will automatically update to this amount.
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
          {sizesText.split(",").map((s) => s.trim()).filter(Boolean).map((sz) => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#443452" }}>{sz}:</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "12px", color: "#7451ba", fontWeight: "700" }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sizePrices[sz] !== undefined ? sizePrices[sz] : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSizePrices((prev) => ({
                      ...prev,
                      [sz]: val ? Number(val) : (price ? Number(price) : 0),
                    }));
                  }}
                  placeholder={price ? `Default: ₹${price}` : "e.g. 499"}
                  style={{ width: "100%", padding: "4px 8px", fontSize: "12px", borderRadius: "6px", border: "1px solid #d4c8db" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Dynamic Sub-Type & Variety Photo Manager for Admin */}
    <div style={{ padding: "14px", background: "#f8f5fc", border: "1.5px solid #dcd1eb", borderRadius: "10px", marginTop: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div>
          <strong style={{ fontSize: "12px", color: "#3a2455" }}>
            ✨ Product Sub-Types &amp; Specific Photo Manager
          </strong>
          <span style={{ fontSize: "10px", color: "#78658d", display: "block" }}>
            Add sub-types (e.g. Mixed Fruits, Anjeer, Almond) and upload specific photos for each
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const newName = prompt("Enter new sub-type name (e.g. Almond, Anjeer, Lemon):");
            if (newName && newName.trim()) {
              const trimmed = newName.trim();
              setVariantsList((prev) => [
                ...prev,
                {
                  name: trimmed,
                  hex: "#7451ba",
                  images: []
                }
              ]);
              setActiveVariantTab(variantsList.length);
              setColorsText((prev) => prev ? `${prev}, ${trimmed}` : trimmed);
            }
          }}
          style={{
            padding: "5px 10px",
            background: "#7451ba",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Plus size={13} /> Add Sub-Type
        </button>
      </div>

      {/* Sub-type selector tabs */}
      {variantsList.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {variantsList.map((v, vIdx) => (
              <button
                key={v.name + vIdx}
                type="button"
                onClick={() => setActiveVariantTab(vIdx)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: activeVariantTab === vIdx ? "2px solid #7451ba" : "1px solid #d4c8e5",
                  background: activeVariantTab === vIdx ? "#7451ba" : "#fff",
                  color: activeVariantTab === vIdx ? "#fff" : "#483660",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: v.hex }} />
                {v.name} ({v.images.length} photos)
              </button>
            ))}
          </div>

          {/* Upload photos for the selected sub-type tab */}
          {variantsList[activeVariantTab] && (
            <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e5dbee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#37274b" }}>
                  Upload Multiple Photos for &ldquo;{variantsList[activeVariantTab].name}&rdquo;:
                </span>
                <label style={{
                  cursor: isUploading ? "not-allowed" : "pointer",
                  padding: "5px 10px",
                  background: "#7451ba",
                  color: "#fff",
                  borderRadius: "5px",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <Upload size={12} />
                  {isUploading ? "Uploading..." : `Upload Photos for ${variantsList[activeVariantTab].name}`}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      try {
                        setIsUploading(true);
                        const formData = new FormData();
                        for (let i = 0; i < files.length; i++) {
                          formData.append("files", files[i]);
                        }
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        const newUrls: string[] = Array.isArray(data.urls) ? data.urls : (data.url ? [data.url] : []);
                        if (newUrls.length > 0) {
                          setVariantsList((prev) => {
                            const updated = [...prev];
                            const cur = updated[activeVariantTab];
                            if (cur) {
                              cur.images = Array.from(new Set([...cur.images, ...newUrls]));
                            }
                            return updated;
                          });
                        }
                      } catch {
                        setError("Failed uploading sub-type images");
                      } finally {
                        setIsUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>

              {/* Sub-type Custom Price & Weight Pricing */}
              <div style={{ margin: "10px 0", padding: "10px", background: "#faf8fc", border: "1px dashed #d6c6e7", borderRadius: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "11px", color: "#54376f" }}>
                    💰 Specific Prices for &ldquo;{variantsList[activeVariantTab].name}&rdquo; (Optional):
                  </strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#614e76" }}>Base Price: ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variantsList[activeVariantTab].price !== undefined ? variantsList[activeVariantTab].price : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariantsList((prev) => {
                          const updated = [...prev];
                          const cur = updated[activeVariantTab];
                          if (cur) cur.price = val ? Number(val) : undefined;
                          return updated;
                        });
                      }}
                      placeholder={price ? `Default: ₹${price}` : "0"}
                      style={{ width: "90px", padding: "3px 6px", fontSize: "11px", borderRadius: "4px", border: "1px solid #c9bad9" }}
                    />
                  </div>
                </div>

                {/* Sub-type size prices */}
                {sizesText.split(",").map((s) => s.trim()).filter(Boolean).length > 0 && (
                  <div style={{ marginTop: "6px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                    {sizesText.split(",").map((s) => s.trim()).filter(Boolean).map((sz) => {
                      const curVar = variantsList[activeVariantTab];
                      const curSzPrices = curVar.sizePrices || {};
                      const defaultP = sizePrices[sz] !== undefined ? sizePrices[sz] : (price ? Number(price) : "");
                      return (
                        <div key={sz} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "600", color: "#483660" }}>{sz}:</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#7451ba", fontWeight: "700" }}>₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={curSzPrices[sz] !== undefined ? curSzPrices[sz] : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setVariantsList((prev) => {
                                  const updated = [...prev];
                                  const cur = updated[activeVariantTab];
                                  if (cur) {
                                    cur.sizePrices = {
                                      ...(cur.sizePrices || {}),
                                      [sz]: val ? Number(val) : undefined as any,
                                    };
                                  }
                                  return updated;
                                });
                              }}
                              placeholder={defaultP ? `Default: ₹${defaultP}` : "e.g. 499"}
                              style={{ width: "100%", padding: "3px 6px", fontSize: "11px", borderRadius: "4px", border: "1px solid #d4c8db" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Thumbnails of current sub-type */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {variantsList[activeVariantTab].images.length > 0 ? (
                  variantsList[activeVariantTab].images.map((img, imgIdx) => (
                    <div key={imgIdx} style={{ position: "relative", width: "60px", height: "60px", borderRadius: "6px", overflow: "hidden", border: "1px solid #dcd3ea" }}>
                      <img src={img} alt="Sub-type preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => {
                          setVariantsList((prev) => {
                            const updated = [...prev];
                            const cur = updated[activeVariantTab];
                            if (cur) {
                              cur.images = cur.images.filter((_, idx) => idx !== imgIdx);
                            }
                            return updated;
                          });
                        }}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "50%", width: "15px", height: "15px", display: "grid", placeItems: "center", cursor: "pointer", fontSize: "9px" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "11px", color: "#9586a8", fontStyle: "italic" }}>
                    No photos added yet for &ldquo;{variantsList[activeVariantTab].name}&rdquo;. Click &ldquo;Upload Photos&rdquo; above.
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <span style={{ fontSize: "11px", color: "#8a75a0", fontStyle: "italic" }}>
          Type colors/varieties above or click &ldquo;+ Add Sub-Type&rdquo; to create varieties like Almond, Anjeer, etc.
        </span>
      )}
    </div>
    <div className={styles.formRow}><label>SKU <small className={styles.formHint}>Unique product code</small><input value={sku} onChange={(event) => { setSku(event.target.value); setError(""); }} placeholder="Generated if blank" maxLength={40} /></label><label>Visibility<select value={status} onChange={(event) => setStatus(event.target.value as AdminProduct["status"])}><option>Published</option><option>Draft</option></select></label></div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <div className={styles.modalActions}>{returnToProducts ? <Link href="/admin/products" className={styles.secondaryButton}>Cancel</Link> : <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={isSubmitting}>Cancel</button>}<button className={styles.primaryButton} type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (product ? "Save changes" : "Add product")} <Check size={15} /></button></div>
  </form></section></div>;
}
function CategoryDialog({ category, onClose, onSave }: { category: AdminCategory | null; onClose: () => void; onSave: (name: string, description: string, subcategories: string[], gstRate?: number, hsnCode?: string) => boolean | Promise<boolean> }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [subcategoriesText, setSubcategoriesText] = useState(
    Array.isArray(category?.subcategories) 
      ? category.subcategories.join(", ") 
      : (category?.subcategories || "")
  );
  const [gstRate, setGstRate] = useState<string>(category?.gstRate !== undefined ? String(category.gstRate) : "12");
  const [hsnCode, setHsnCode] = useState<string>(category?.hsnCode || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setSubcategoriesText(
        Array.isArray(category.subcategories) 
          ? category.subcategories.join(", ") 
          : (category.subcategories || "")
      );
      setGstRate(category.gstRate !== undefined ? String(category.gstRate) : "12");
      setHsnCode(category.hsnCode || "");
    } else {
      setName("");
      setDescription("");
      setSubcategoriesText("");
      setGstRate("12");
      setHsnCode("");
    }
  }, [category]);
  return <div className={styles.modalScrim} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section id="category-dialog" className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="category-dialog-title"><div className={styles.modalHead}><div><span className={styles.eyebrow}>COLLECTIONS &amp; TAX SETTINGS</span><h2 id="category-dialog-title">{category ? "Edit collection & GST" : "Add collection & GST"}</h2><p>Configure collection name, description, GST slab rate, and HSN code for tax compliance.</p></div><button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close"><X size={18} /></button></div><form className={styles.modalForm} onSubmit={(event) => { 
    event.preventDefault(); 
    const subs = subcategoriesText.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedGst = Number(gstRate);
    if (!onSave(name.trim(), description.trim(), subs, isNaN(parsedGst) ? 12 : parsedGst, hsnCode.trim())) setError("A collection with this name already exists."); 
  }}>
    <label>Collection name<input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Food & NGO Products" required maxLength={80} /></label>
    <div className={styles.formRow}>
      <label>
        Applicable GST Rate (%)
        <select value={gstRate} onChange={(e) => setGstRate(e.target.value)}>
          <option value="0">0% (Tax Exempt / Nil)</option>
          <option value="5">5% GST (Pickles, Spices, Grains, Bags)</option>
          <option value="12">12% GST (Pottery, Handmade Decor, Table Linen)</option>
          <option value="18">18% GST (Ceramics, Crafts, Personal Care)</option>
          <option value="28">28% GST (Luxury Items)</option>
        </select>
      </label>
      <label>
        Default HSN Code
        <input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="e.g. 2106, 6305, 6912" maxLength={10} />
      </label>
    </div>
    <label>Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description of this collection..." required maxLength={240} /></label>
    <label>Sub-collections <small className={styles.formHint}>(Separate by comma, e.g. Pickle, Dryfruit Laddu, Papad)</small><input value={subcategoriesText} onChange={(event) => setSubcategoriesText(event.target.value)} placeholder="Pickle, Dryfruit Laddu, Papad, Spices" maxLength={300} /></label>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button type="submit" className={styles.primaryButton}>{category ? "Save changes" : "Add collection"} <Check size={15} /></button></div>
  </form></section></div>;
}

function SubcollectionDialog({ categories, onClose, onSave }: { categories: AdminCategory[]; onClose: () => void; onSave: (parentCategoryName: string, subName: string) => boolean | Promise<boolean> }) {
  const [parentName, setParentName] = useState(categories[0]?.name || "");
  const [subName, setSubName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategoryObj = categories.find((c) => c.name === parentName);
  const currentSubs = Array.isArray(selectedCategoryObj?.subcategories)
    ? selectedCategoryObj.subcategories
    : (selectedCategoryObj?.subcategories ? String(selectedCategoryObj.subcategories).split(",").map((s) => s.trim()).filter(Boolean) : []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) {
      setError("Please enter a sub-collection name.");
      return;
    }
    if (!parentName) {
      setError("Please select a parent collection.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const success = await onSave(parentName, subName.trim());
      if (!success) {
        setError(`"${subName.trim()}" already exists in ${parentName}.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalScrim} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="subcollection-title">
        <div className={styles.modalHead}>
          <div>
            <span className={styles.eyebrow}>ORGANIZATION</span>
            <h2 id="subcollection-title">Add Sub-collection</h2>
            <p>Create a dedicated sub-department under any existing collection.</p>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <label>
            Select Parent Collection
            <select value={parentName} onChange={(e) => setParentName(e.target.value)} required>
              {categories.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            New Sub-collection Name
            <input
              autoFocus
              value={subName}
              onChange={(e) => {
                setSubName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Dryfruit Laddus, Organic Honey, Ceramic Bowls"
              required
              maxLength={80}
            />
          </label>

          {/* Current existing subcategories in the selected parent */}
          <div style={{ padding: "12px", background: "#fbf9fd", borderRadius: "8px", border: "1px solid #ebe4f3", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#54435b", display: "block", marginBottom: "6px" }}>
              Existing Sub-departments in {parentName}:
            </span>
            {currentSubs.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {currentSubs.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "11px",
                      background: "#f0eaf7",
                      color: "#684882",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: "11px", color: "#8a75a0", fontStyle: "italic" }}>
                No sub-collections yet in this category.
              </span>
            )}
          </div>

          {error && <p className={styles.formError} role="alert">{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Sub-collection"} <Check size={15} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function OrderDialog({ order, onClose, onStatusChange }: { order: AdminOrder; onClose: () => void; onStatusChange: (status: AdminOrder["status"]) => void }) {
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.modalScrim} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section id="order-dialog" className={`${styles.modal} ${styles.orderModal}`} role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
        <div className={styles.modalHead}>
          <div>
            <span className={styles.eyebrow}>ORDER INVOICE &amp; DETAILS</span>
            <h2 id="order-dialog-title">Order {order.id}</h2>
            <p>Placed on {formatDate(order.createdAt)} · Payment: {order.paymentMethod || "UPI"}</p>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className={styles.orderMetaGrid}>
          <div className={styles.orderMetaItem}>
            <span>Customer</span>
            <strong>{order.customer}</strong>
            {order.customerPhone && <small style={{ color: "#746a82" }}>📞 {order.customerPhone}</small>}
            {order.customerEmail && <small style={{ color: "#746a82" }}>✉️ {order.customerEmail}</small>}
          </div>
          <div className={styles.orderMetaItem}>
            <span>Current Status</span>
            <select
              className={`${styles.statusSelect} ${styles[`status${order.status}`]}`}
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value as AdminOrder["status"])}
            >
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>
          <div className={styles.orderMetaItem}>
            <span>Total Amount</span>
            <strong style={{ fontSize: "14px", color: "#238768" }}>{formatCurrency(order.total)}</strong>
          </div>
        </div>

        {order.customerAddress && (
          <div className={styles.orderSectionBlock}>
            <h4>Delivery Address</h4>
            <div className={styles.orderAddressBox}>{order.customerAddress}</div>
          </div>
        )}

        <div className={styles.orderSectionBlock}>
          <h4>Order Items ({items.length ? items.length : "Standard Package"})</h4>
          {items.length > 0 ? (
            <table className={styles.orderItemsTable}>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>SKU</th>
                  <th>QTY</th>
                  <th style={{ textAlign: "right" }}>PRICE</th>
                  <th style={{ textAlign: "right" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ color: "#9288a2", fontFamily: "monospace" }}>{item.sku || "—"}</td>
                    <td>{item.quantity}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: "right" }}><strong>{formatCurrency(item.price * item.quantity)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.orderAddressBox} style={{ color: "#8a8197" }}>
              Standard order items packaged for delivery ({formatCurrency(order.total)})
            </div>
          )}
        </div>

        <div className={styles.invoiceActions}>
          <button type="button" className={styles.secondaryButton} onClick={handlePrint}>
            <Printer size={15} /> Download / Print Official Tax Invoice (PDF)
          </button>
          <button type="button" className={styles.primaryButton} onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) { const kind = status.toLowerCase().replaceAll(" ", ""); return <span className={`${styles.statusPill} ${styles[`status${kind}`] ?? ""}`}><i />{status}</span>; }

function InquiriesSection({
  inquiries,
  onStatus,
}: {
  inquiries: any[];
  onStatus: (id: string, status: "New" | "Read" | "Responded", reply?: string) => void;
}) {
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [replyInput, setReplyInput] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccessToast, setReplySuccessToast] = useState("");

  // Sort and Filter logic
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // 1. Status Filter
      if (statusFilter !== "all" && inq.status !== statusFilter) return false;

      // 2. Time Filter (Day-wise, Week-wise, Month-wise)
      if (timeFilter !== "all") {
        const inqDate = new Date(inq.createdAt || Date.now());
        const now = new Date();
        const diffMs = now.getTime() - inqDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (timeFilter === "today") {
          // Within last 24 hours or same calendar date
          const isSameDay = inqDate.toDateString() === now.toDateString() || diffHours <= 24;
          if (!isSameDay) return false;
        } else if (timeFilter === "week") {
          // Within last 7 days
          if (diffHours > 24 * 7) return false;
        } else if (timeFilter === "month") {
          // Within last 30 days
          if (diffHours > 24 * 30) return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [inquiries, statusFilter, timeFilter]);

  const handleOpenInquiry = (inq: any) => {
    setSelectedInquiry(inq);
    setReplyInput(inq.adminReply || "");
    if (inq.status === "New") {
      onStatus(inq.id, "Read");
    }
  };

  const handleSendAdminReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyInput.trim()) return;

    setSendingReply(true);
    await onStatus(selectedInquiry.id, "Responded", replyInput.trim());

    // Update selected inquiry locally
    setSelectedInquiry({
      ...selectedInquiry,
      status: "Responded",
      adminReply: replyInput.trim(),
      repliedAt: new Date().toISOString(),
    });

    setSendingReply(false);
    setReplySuccessToast("Response saved & synced to Customer Profile!");
    setTimeout(() => setReplySuccessToast(""), 3500);
  };

  return (
    <>
      {/* Interactive Metric Cards */}
      <div className={styles.statStrip}>
        <div
          className={`${styles.statCardInteractive} ${statusFilter === "all" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter("all")}
          title="Click to view all customer inquiries"
        >
          <span>Total Inquiries</span>
          <strong>{inquiries.length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${statusFilter === "New" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter(statusFilter === "New" ? "all" : "New")}
          title="Click to filter New inquiries"
        >
          <span>New {statusFilter === "New" && <small style={{ color: "#b77126" }}>● Active</small>}</span>
          <strong className={styles.warningText}>{inquiries.filter((i) => i.status === "New").length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${statusFilter === "Read" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter(statusFilter === "Read" ? "all" : "Read")}
          title="Click to filter Read inquiries"
        >
          <span>Read {statusFilter === "Read" && <small style={{ color: "#7451ba" }}>● Active</small>}</span>
          <strong>{inquiries.filter((i) => i.status === "Read").length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${statusFilter === "Responded" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter(statusFilter === "Responded" ? "all" : "Responded")}
          title="Click to filter Responded inquiries"
        >
          <span>Responded {statusFilter === "Responded" && <small style={{ color: "#166534" }}>● Active</small>}</span>
          <strong style={{ color: "#166534" }}>{inquiries.filter((i) => i.status === "Responded").length}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeading} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <span className={styles.eyebrow}>CUSTOMER COMMUNICATION</span>
            <h2>Inquiry Inbox ({filteredInquiries.length})</h2>
            <p>Direct inquiries submitted from storefront with day/week/month sorting and official customer responses.</p>
          </div>

          {/* Time & Date Filter Dropdown (Day, Week, Month) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f8f5fc", border: "1px solid #ebdff2", borderRadius: "8px", padding: "4px 8px" }}>
              <CalendarDays size={14} color="#7451ba" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "12.5px",
                  fontWeight: "650",
                  color: "#423254",
                  outline: "none",
                  cursor: "pointer",
                }}
                title="Sort & Filter by Day, Week or Month"
              >
                <option value="all">📅 All Time (All Dates)</option>
                <option value="today">📆 Today / Day-wise</option>
                <option value="week">🗓️ This Week (Last 7 Days)</option>
                <option value="month">📊 This Month (Last 30 Days)</option>
              </select>
            </div>

            {(statusFilter !== "all" || timeFilter !== "all") && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setStatusFilter("all");
                  setTimeFilter("all");
                }}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                Reset filters ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>CONTACT</th>
                <th>SUBJECT &amp; MESSAGE</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq) => (
                <tr
                  key={inq.id}
                  style={{
                    background: inq.status === "New" ? "rgba(244, 237, 248, 0.35)" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    // If target is not the select dropdown, open modal
                    const target = e.target as HTMLElement;
                    if (target.tagName.toLowerCase() !== "select" && target.tagName.toLowerCase() !== "option" && target.tagName.toLowerCase() !== "a") {
                      handleOpenInquiry(inq);
                    }
                  }}
                  title="Click anywhere on this customer row to view details & reply"
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={styles.avatar} style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                        {inq.name ? inq.name.slice(0, 2).toUpperCase() : "CU"}
                      </span>
                      <div>
                        <strong style={{ color: "#372747", fontSize: "13.5px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          {inq.name}
                          <Eye size={12} color="#7451ba" />
                        </strong>
                        {inq.status === "New" && (
                          <span style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "9.5px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px", marginLeft: "4px" }}>
                            NEW
                          </span>
                        )}
                        {inq.adminReply && (
                          <span style={{ display: "block", color: "#166534", fontSize: "10.5px", fontWeight: "600", marginTop: "2px" }}>
                            ✓ Responded
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <a
                        href={`mailto:${inq.email}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "#7652c8", fontWeight: "600", fontSize: "12.5px" }}
                      >
                        {inq.email}
                      </a>
                    </div>
                    {inq.phone && <small style={{ color: "#8a8197", display: "block", marginTop: "2px" }}>📞 {inq.phone}</small>}
                  </td>
                  <td style={{ maxWidth: "340px" }}>
                    <strong style={{ color: "#2e243d", display: "block", fontSize: "13px" }}>{inq.subject || "General inquiry"}</strong>
                    <p style={{ margin: "2px 0 0", color: "#6a5e73", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {inq.message || "No message body provided"}
                    </p>
                  </td>
                  <td style={{ whiteSpace: "nowrap", fontSize: "12px", color: "#7a6f87" }}>
                    {formatDate(inq.createdAt)}
                  </td>
                  <td>
                    <select
                      className={styles.filterSelect}
                      value={inq.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onStatus(inq.id, e.target.value as any)}
                      style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        fontWeight: "650",
                        color: inq.status === "New" ? "#92400e" : inq.status === "Responded" ? "#166534" : "#4a3b56",
                      }}
                    >
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="Responded">Responded</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInquiry(inq);
                      }}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", fontSize: "12px" }}
                    >
                      <Eye size={13} /> View &amp; Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInquiries.length === 0 && (
            <EmptyState
              title="No inquiries found"
              body={statusFilter !== "all" || timeFilter !== "all" ? "No messages match your selected date or status filters." : "Customer messages submitted through the contact page will appear here."}
            />
          )}
        </div>
      </section>

      {/* Customer Inquiry Details & Real In-App Response Modal */}
      {selectedInquiry && (
        <div
          className={styles.modalScrim}
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedInquiry(null);
          }}
        >
          <section
            className={`${styles.modal} ${styles.orderModal}`}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className={styles.modalHead}>
              <div>
                <span className={styles.eyebrow}>CUSTOMER INQUIRY &amp; SUPPORT</span>
                <h2 style={{ fontSize: "18px", color: "#2d1f3b", marginTop: "2px" }}>
                  {selectedInquiry.subject || "Customer Inquiry"}
                </h2>
                <p style={{ fontSize: "12px", color: "#776b85" }}>
                  From <strong>{selectedInquiry.name}</strong> · Received on {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setSelectedInquiry(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Contact Details */}
            <div className={styles.orderSectionBlock}>
              <h4 style={{ margin: "0 0 6px", fontSize: "12.5px", color: "#54336c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Customer Information
              </h4>
              <div style={{ background: "#fcfafc", border: "1px solid #ebddee", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ fontWeight: "700", color: "#312340" }}>{selectedInquiry.name}</div>
                  <div style={{ marginTop: "2px" }}>
                    Email: <a href={`mailto:${selectedInquiry.email}`} style={{ color: "#7652c8", fontWeight: 600 }}>{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.phone && (
                    <div style={{ marginTop: "2px", color: "#61556e" }}>
                      Phone: <strong>{selectedInquiry.phone}</strong>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "99px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: selectedInquiry.status === "New" ? "#fef3c7" : selectedInquiry.status === "Responded" ? "#f0fdf4" : "#f3e8ff",
                      color: selectedInquiry.status === "New" ? "#92400e" : selectedInquiry.status === "Responded" ? "#166534" : "#6b21a8",
                      border: "1px solid currentColor",
                    }}
                  >
                    ● Status: {selectedInquiry.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Message Body */}
            <div className={styles.orderSectionBlock}>
              <h4 style={{ margin: "0 0 6px", fontSize: "12.5px", color: "#54336c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Inquiry Message
              </h4>
              <div style={{ background: "#ffffff", border: "1.5px solid #ece4f0", borderRadius: "10px", padding: "14px 16px", fontSize: "13.5px", color: "#2e243d", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {selectedInquiry.message || "No message body."}
              </div>
            </div>

            {/* Admin Response Box (Amazon/Nykaa style official reply) */}
            <div className={styles.orderSectionBlock}>
              <h4 style={{ margin: "0 0 6px", fontSize: "12.5px", color: "#54336c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Official Foundation Response
              </h4>

              <form onSubmit={handleSendAdminReply}>
                <textarea
                  rows={4}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type your official reply to this customer (e.g. Hello Punam, thank you for reaching out! We are glad to inform you that...)"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #d8cbdf",
                    fontSize: "13px",
                    color: "#281b35",
                    lineHeight: 1.5,
                    resize: "vertical",
                    outline: "none",
                  }}
                  required
                />

                {replySuccessToast && (
                  <div style={{ marginTop: "6px", color: "#166534", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Check size={14} /> {replySuccessToast}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyInput.trim()}
                    className={styles.primaryButton}
                    style={{ fontSize: "12.5px", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {sendingReply ? "Saving response..." : <><Check size={14} /> Send &amp; Save Response</>}
                  </button>

                  <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    {/* Direct Web Gmail Compose with multiple account support */}
                    <a
                      href={`https://mail.google.com/mail/u/?authuser=0&view=cm&fs=1&to=${encodeURIComponent(selectedInquiry.email)}&su=${encodeURIComponent('Re: ' + (selectedInquiry.subject || 'Your Swachetna Foundation Inquiry'))}&body=${encodeURIComponent(replyInput || 'Hello ' + selectedInquiry.name + ',\n\nThank you for contacting Swachetna Foundation!\n\n')}`}
                      className={styles.primaryButton}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (!selectedInquiry.adminReply && replyInput.trim()) {
                          onStatus(selectedInquiry.id, "Responded", replyInput.trim());
                        }
                      }}
                      style={{ fontSize: "12px", padding: "7px 15px", display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #ea4335, #c5221f)", borderColor: "#b31412", boxShadow: "0 2px 6px rgba(234, 67, 53, 0.28)" }}
                      title="Open directly in Gmail web composer"
                    >
                      Compose in Gmail ✉️
                    </a>

                    {/* Standard mailto fallback */}
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Your Swachetna Foundation Inquiry')}&body=${encodeURIComponent(replyInput || 'Hello ' + selectedInquiry.name + ',\n\nThank you for contacting Swachetna Foundation!\n\n')}`}
                      className={styles.secondaryButton}
                      onClick={() => {
                        if (!selectedInquiry.adminReply && replyInput.trim()) {
                          onStatus(selectedInquiry.id, "Responded", replyInput.trim());
                        }
                      }}
                      style={{ fontSize: "12px", padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                      title="Open in default mail client"
                    >
                      Default Mail
                    </a>
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalActions} style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setSelectedInquiry(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function CouponsSection({ coupons, onSave }: { coupons: AdminCoupon[]; onSave: (coupons: AdminCoupon[]) => Promise<boolean> }) {
  const [list, setList] = useState<AdminCoupon[]>(coupons);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setList(coupons);
  }, [coupons]);

  const handleAddCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSaving(true);
    const newCoupon: AdminCoupon = {
      id: `cpn-${Date.now().toString(36)}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 0,
      minOrderAmount: minOrder ? Number(minOrder) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      status: "Active",
      description: desc.trim() || `${discountValue}${discountType === "percentage" ? "% off" : "₹ off"}`,
    };

    const updated = [newCoupon, ...list.filter((c) => c.code !== newCoupon.code)];
    setList(updated);
    await onSave(updated);

    setCode("");
    setDiscountValue("");
    setMinOrder("");
    setMaxDiscount("");
    setDesc("");
    setSaving(false);
  };

  const handleToggleStatus = async (id: string) => {
    const updated = list.map((c) =>
      c.id === id ? { ...c, status: (c.status === "Active" ? "Inactive" : "Active") as AdminCoupon["status"] } : c
    );
    setList(updated);
    await onSave(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    await onSave(updated);
  };

  const filteredCoupons = list.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  const activeCount = list.filter((c) => c.status === "Active").length;
  const percentageCount = list.filter((c) => c.discountType === "percentage").length;
  const flatCount = list.filter((c) => c.discountType === "fixed").length;

  return (
    <>
      {/* Interactive Coupon Stat Strip */}
      <div className={styles.statStrip}>
        <div
          className={`${styles.statCardInteractive} ${statusFilter === "all" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter("all")}
          title="Click to view all coupons"
        >
          <span>Total Coupons</span>
          <strong>{list.length}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${statusFilter === "Active" ? styles.statCardActive : ""}`}
          onClick={() => setStatusFilter(statusFilter === "Active" ? "all" : "Active")}
          title="Click to filter Active promo codes"
        >
          <span>Active Promo Codes {statusFilter === "Active" && <small style={{ color: "#166534" }}>●</small>}</span>
          <strong style={{ color: "#166534" }}>{activeCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive}`}
          title="Percentage discount codes"
        >
          <span>Percentage (%) Codes</span>
          <strong style={{ color: "#7451ba" }}>{percentageCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive}`}
          title="Flat amount discount codes"
        >
          <span>Flat (₹) Off Codes</span>
          <strong style={{ color: "#b77126" }}>{flatCount}</strong>
        </div>
      </div>

      <section className={styles.panel} style={{ marginBottom: "20px" }}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>CREATE NEW PROMOTION</span>
            <h2>Create Discount Coupon</h2>
            <p>Add promo codes that customers can apply during checkout to receive authentic instant discounts.</p>
          </div>
        </div>

        <form onSubmit={handleAddCoupon} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginTop: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Coupon Code (e.g. SWACHETNA10) *
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FESTIVE20"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #d4c8db", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Discount Type *
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #d4c8db", background: "#fff" }}
            >
              <option value="percentage">Percentage (%) Off</option>
              <option value="fixed">Flat Amount (₹) Off</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Discount Value {discountType === "percentage" ? "(%) *" : "(₹) *"}
            </label>
            <input
              type="number"
              min="1"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 150"}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #d4c8db" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Min Order Value (₹)
            </label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="e.g. 500 (Optional)"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #d4c8db" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
                Description / Purpose
              </label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. 20% discount on artisan crafts for Diwali celebration"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "9px", border: "1px solid #d4c8db" }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className={styles.primaryButton}
              style={{ minHeight: "44px", padding: "0 24px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {saving ? "Saving..." : <><Plus size={16} /> Add Coupon</>}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>ACTIVE &amp; SCHEDULED PROMOTIONS</span>
            <h2>Coupons List ({filteredCoupons.length})</h2>
            <p>Active promo codes can be applied by shoppers on the bag / checkout page.</p>
          </div>
          {statusFilter !== "all" && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setStatusFilter("all")}
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Reset filter ✕
            </button>
          )}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>COUPON CODE</th>
                <th>DISCOUNT VALUE</th>
                <th>MINIMUM CART</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontSize: "14px", color: "#4f2b66", letterSpacing: "0.06em", background: "#f5edf8", padding: "6px 12px", borderRadius: "8px", border: "1px dashed #c4a9cd", display: "inline-block" }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <strong style={{ fontSize: "14px", color: "#166534" }}>
                      {c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Off`}
                    </strong>
                  </td>
                  <td>
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : <span style={{ color: "#958ba3" }}>None</span>}
                  </td>
                  <td style={{ color: "#54465b", fontSize: "13px" }}>
                    {c.description || "General promotion"}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "99px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: "1px solid currentColor",
                        background: c.status === "Active" ? "#eef8f2" : "#fbf9fc",
                        color: c.status === "Active" ? "#1a8f4c" : "#8a7e93"
                      }}
                      title="Click to toggle Active / Inactive status"
                    >
                      {c.status === "Active" ? "● Active" : "○ Inactive"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handleDelete(c.id)}
                      title="Delete Coupon"
                    >
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCoupons.length === 0 && (
            <EmptyState title="No coupons created yet" body="Create a promo code above to offer discounts on your storefront." />
          )}
        </div>
      </section>
    </>
  );
}

function ReviewsSection({ products, onSaveProducts }: { products: AdminProduct[]; onSaveProducts: (products: AdminProduct[]) => Promise<boolean> }) {
  // Aggregate all reviews across products + default authentic reviews if empty
  const defaultSampleReviews = useMemo(() => [
    {
      productSlug: "traditional-mango-pickle",
      productName: "Gaon-style Homemade Traditional Pickle",
      productImage: "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg",
      review: {
        id: "rev-sample-1",
        author: "Meera Joshi",
        rating: 5,
        comment: "Absolutely authentic gaon-style mango pickle! The mustard oil and sun-dried spices remind me of my grandmother's recipe in Kolhapur.",
        date: "28 Oct 2026",
        verified: true,
      }
    },
    {
      productSlug: "nutritious-dryfruit-ding-laddu",
      productName: "Organic Dink & Dryfruit Energy Laddu",
      productImage: "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg",
      review: {
        id: "rev-sample-2",
        author: "Anand Shinde",
        rating: 5,
        comment: "Excellent quality and pure cow ghee aroma. Provides tremendous natural energy in the morning. Proud to support rural self-help groups!",
        date: "26 Oct 2026",
        verified: true,
      }
    },
    {
      productSlug: "earth-toned-handcrafted-piece",
      productName: "Terracotta Vase Pottery",
      productImage: "/uploads/matte-ochre-vase-1793443956049-e5agp.jpg",
      review: {
        id: "rev-sample-3",
        author: "Radhika Sharma",
        rating: 4,
        comment: "The terracotta pot finish is truly artistic and earth-toned. Looks stunning in my living room. Packaging was very secure.",
        date: "22 Oct 2026",
        verified: true,
      }
    }
  ], []);

  const [deletedReviewIds, setDeletedReviewIds] = useState<string[]>([]);
  const [userSubmittedReviews, setUserSubmittedReviews] = useState<Array<{ productSlug: string; review: any }>>([]);

  const syncReviews = () => {
    try {
      const delStored = window.localStorage.getItem("swachetna-deleted-review-ids");
      if (delStored) setDeletedReviewIds(JSON.parse(delStored));
      const userStored = window.localStorage.getItem("swachetna-user-submitted-reviews");
      if (userStored) setUserSubmittedReviews(JSON.parse(userStored));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    syncReviews();
    window.addEventListener("swachetna-reviews-updated", syncReviews);
    window.addEventListener("storage", syncReviews);
    const revTimer = window.setInterval(syncReviews, 3000);
    return () => {
      window.removeEventListener("swachetna-reviews-updated", syncReviews);
      window.removeEventListener("storage", syncReviews);
      window.clearInterval(revTimer);
    };
  }, []);

  const allReviewsWithProduct = useMemo(() => {
    const list: Array<{ productSlug: string; productName: string; productImage?: string; review: any }> = [];
    const seenIds = new Set<string>();

    // 1. Process reviews from product catalog
    products.forEach((p) => {
      if (Array.isArray(p.reviews) && p.reviews.length > 0) {
        p.reviews.forEach((r) => {
          if (!deletedReviewIds.includes(r.id) && !seenIds.has(r.id)) {
            seenIds.add(r.id);
            list.push({ productSlug: p.slug, productName: p.name, productImage: p.image, review: r });
          }
        });
      }
    });

    // 2. Real-time customer reviews submitted from product pages (instant without refresh)
    userSubmittedReviews.forEach((usr) => {
      if (!deletedReviewIds.includes(usr.review.id) && !seenIds.has(usr.review.id)) {
        seenIds.add(usr.review.id);
        const match = products.find((p) => p.slug === usr.productSlug);
        list.unshift({
          productSlug: usr.productSlug,
          productName: match ? match.name : usr.productSlug,
          productImage: match?.image,
          review: usr.review,
        });
      }
    });

    if (list.length === 0) {
      return defaultSampleReviews.filter((sr) => !deletedReviewIds.includes(sr.review.id));
    }
    return list.filter((item) => !deletedReviewIds.includes(item.review.id));
  }, [products, defaultSampleReviews, deletedReviewIds, userSubmittedReviews]);

  const [filterRating, setFilterRating] = useState("all");
  const [selectedProductReviewModal, setSelectedProductReviewModal] = useState<{
    slug: string;
    name: string;
    image?: string;
    price?: number;
    reviews: Array<{ review: any }>;
  } | null>(null);

  const handleDeleteReview = async (productSlug: string, reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    setDeletedReviewIds((prev) => {
      const next = [...prev, reviewId];
      try {
        window.localStorage.setItem("swachetna-deleted-review-ids", JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
    const updated = products.map((p) => {
      if (p.slug === productSlug && Array.isArray(p.reviews)) {
        return {
          ...p,
          reviews: p.reviews.filter((r: any) => r.id !== reviewId),
        };
      }
      return p;
    });
    await onSaveProducts(updated);
  };

  const filtered = allReviewsWithProduct.filter((item) => {
    if (filterRating === "all") return true;
    return item.review.rating === Number(filterRating);
  });

  const totalReviewsCount = allReviewsWithProduct.length;
  const fiveStarsCount = allReviewsWithProduct.filter((r) => r.review.rating === 5).length;
  const fourStarsCount = allReviewsWithProduct.filter((r) => r.review.rating === 4).length;
  const threeStarsCount = allReviewsWithProduct.filter((r) => r.review.rating === 3).length;

  return (
    <>
      {/* Interactive Review Stat Strip */}
      <div className={styles.statStrip}>
        <div
          className={`${styles.statCardInteractive} ${filterRating === "all" ? styles.statCardActive : ""}`}
          onClick={() => setFilterRating("all")}
          title="Click to view all reviews"
        >
          <span>Total Reviews</span>
          <strong>{totalReviewsCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${filterRating === "5" ? styles.statCardActive : ""}`}
          onClick={() => setFilterRating(filterRating === "5" ? "all" : "5")}
          title="Click to filter 5-Star Reviews"
        >
          <span>5 Stars {filterRating === "5" && <small style={{ color: "#d97706" }}>●</small>}</span>
          <strong style={{ color: "#d97706" }}>{fiveStarsCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${filterRating === "4" ? styles.statCardActive : ""}`}
          onClick={() => setFilterRating(filterRating === "4" ? "all" : "4")}
          title="Click to filter 4-Star Reviews"
        >
          <span>4 Stars {filterRating === "4" && <small style={{ color: "#7451ba" }}>●</small>}</span>
          <strong>{fourStarsCount}</strong>
        </div>

        <div
          className={`${styles.statCardInteractive} ${filterRating === "3" ? styles.statCardActive : ""}`}
          onClick={() => setFilterRating(filterRating === "3" ? "all" : "3")}
          title="Click to filter 3-Star Reviews"
        >
          <span>3 Stars &amp; Below {filterRating === "3" && <small style={{ color: "#8a7e93" }}>●</small>}</span>
          <strong>{threeStarsCount}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>CUSTOMER RATINGS &amp; TESTIMONIALS</span>
            <h2>Product Reviews Moderation ({filtered.length})</h2>
            <p>Verified feedback and testimonials submitted by shoppers directly on product pages.</p>
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CUSTOMER</th>
                <th>RATING</th>
                <th>REVIEW COMMENT</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ productSlug, productName, productImage, review }, idx) => {
                // Find matching product if image not attached
                const matchedProd = products.find((p) => p.slug === productSlug);
                const displayImage = productImage || matchedProd?.image;

                return (
                  <tr key={review.id || `${productSlug}-${review.author}-${idx}`}>
                    <td>
                      <div className={styles.productCell}>
                        <span
                          className={`${styles.productThumb} ${styles[`thumb${idx % 4}`]}`}
                          style={displayImage ? { padding: 0, overflow: "hidden", border: "1px solid #ebdff2", borderRadius: "8px", cursor: "pointer" } : { cursor: "pointer" }}
                          onClick={() => {
                            const productReviews = allReviewsWithProduct.filter((r) => r.productSlug === productSlug);
                            setSelectedProductReviewModal({
                              slug: productSlug,
                              name: productName,
                              image: displayImage,
                              price: matchedProd?.price,
                              reviews: productReviews,
                            });
                          }}
                          title="Click to view product reviews & details"
                        >
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={productName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Package size={17} />
                          )}
                        </span>
                        <span>
                          <button
                            type="button"
                            onClick={() => {
                              const productReviews = allReviewsWithProduct.filter((r) => r.productSlug === productSlug);
                              setSelectedProductReviewModal({
                                slug: productSlug,
                                name: productName,
                                image: displayImage,
                                price: matchedProd?.price,
                                reviews: productReviews,
                              });
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            title="Click to view product reviews & details in Admin"
                          >
                            <strong style={{ fontSize: "13.5px", color: "#5b359c", display: "inline-flex", alignItems: "center", gap: "5px", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                              {productName}
                              <Eye size={13} color="#7451ba" />
                            </strong>
                          </button>
                          <small className={styles.tableSub}>{productSlug}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px", color: "#352844" }}>{review.author}</strong>
                      {review.verified && (
                        <div>
                          <span style={{ fontSize: "10.5px", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "99px", display: "inline-block", marginTop: "3px", fontWeight: "600" }}>
                            ✓ Verified Buyer
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ color: "#f59e0b", display: "flex", gap: "2px", fontSize: "15px" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ opacity: i < review.rating ? 1 : 0.25 }}>★</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ minWidth: "260px", maxWidth: "380px", whiteSpace: "normal", fontSize: "13px", color: "#44354c", lineHeight: 1.55 }}>
                      &ldquo;{review.comment}&rdquo;
                    </td>
                    <td style={{ fontSize: "12.5px", color: "#776c82", whiteSpace: "nowrap" }}>
                      {review.date || "Recent"}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => handleDeleteReview(productSlug, review.id)}
                        title="Delete review"
                        style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fee2e2" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState title="No reviews found" body="Customer reviews submitted on product pages will appear here for management." />
          )}
        </div>
      </section>

      {/* Admin In-Workspace Product Reviews Modal */}
      {selectedProductReviewModal && (
        <div
          className={styles.modalScrim}
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedProductReviewModal(null);
          }}
        >
          <section
            className={`${styles.modal} ${styles.orderModal}`}
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: "680px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className={styles.modalHead}>
              <div>
                <span className={styles.eyebrow}>PRODUCT FEEDBACK & RATINGS</span>
                <h2 style={{ fontSize: "19px", color: "#2d2038", marginTop: "2px" }}>
                  {selectedProductReviewModal.name}
                </h2>
                <p style={{ fontSize: "12.5px", color: "#746982" }}>
                  Customer ratings, feedback & reviews specifically for this product.
                </p>
              </div>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setSelectedProductReviewModal(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Summary Header inside Modal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                background: "#f9f7fc",
                borderRadius: "12px",
                margin: "16px 0 20px",
                border: "1px solid #ede8f4",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #ded3e8",
                  flexShrink: 0,
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {selectedProductReviewModal.image ? (
                  <img
                    src={selectedProductReviewModal.image}
                    alt={selectedProductReviewModal.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Package size={26} color="#7451ba" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "15px", color: "#2a1c38", display: "block" }}>
                  {selectedProductReviewModal.name}
                </strong>
                <div style={{ fontSize: "12px", color: "#8a7e93", marginTop: "2px" }}>
                  Slug: <code style={{ background: "#ede8f4", padding: "1px 5px", borderRadius: "4px" }}>{selectedProductReviewModal.slug}</code>
                  {selectedProductReviewModal.price && (
                    <span style={{ marginLeft: "10px", color: "#166534", fontWeight: "700" }}>
                      ₹{selectedProductReviewModal.price}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  <div style={{ color: "#f59e0b", display: "flex", fontSize: "14px" }}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avgRating = selectedProductReviewModal.reviews.length
                        ? selectedProductReviewModal.reviews.reduce((acc, curr) => acc + curr.review.rating, 0) / selectedProductReviewModal.reviews.length
                        : 5;
                      return <span key={i} style={{ opacity: i < Math.round(avgRating) ? 1 : 0.25 }}>★</span>;
                    })}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#44354c" }}>
                    {selectedProductReviewModal.reviews.length} {selectedProductReviewModal.reviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>
              </div>

              <Link
                href={`/products/${selectedProductReviewModal.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
                style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                title="View live product on storefront"
              >
                Storefront <ExternalLink size={12} />
              </Link>
            </div>

            {/* Individual Reviews List for this Product */}
            <div>
              <h3 style={{ fontSize: "13.5px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#746982", marginBottom: "12px" }}>
                Customer Feedback &amp; Comments ({selectedProductReviewModal.reviews.length})
              </h3>

              {selectedProductReviewModal.reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#8a7e93", fontSize: "13px" }}>
                  No customer reviews have been submitted for this product yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedProductReviewModal.reviews.map(({ review }, revIdx) => (
                    <div
                      key={review.id || revIdx}
                      style={{
                        padding: "14px 16px",
                        background: "#ffffff",
                        border: "1px solid #ebdff2",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{ fontSize: "13.5px", color: "#2d2038" }}>
                            {review.author}
                          </strong>
                          {review.verified && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "10.5px",
                                color: "#166534",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                padding: "1px 6px",
                                borderRadius: "99px",
                                fontWeight: "600",
                              }}
                            >
                              ✓ Verified Buyer
                            </span>
                          )}
                          <div style={{ fontSize: "11px", color: "#9589a0", marginTop: "2px" }}>
                            {review.date || "Recent"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ color: "#f59e0b", display: "flex", gap: "1px", fontSize: "14px" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} style={{ opacity: i < review.rating ? 1 : 0.25 }}>★</span>
                            ))}
                          </div>

                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={async () => {
                              await handleDeleteReview(selectedProductReviewModal.slug, review.id);
                              // update modal state
                              setSelectedProductReviewModal((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  reviews: prev.reviews.filter((r) => r.review.id !== review.id),
                                };
                              });
                            }}
                            title="Delete this review"
                            style={{ width: "30px", height: "30px", color: "#b91c1c", background: "#fef2f2", border: "1px solid #fee2e2" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#473a52", lineHeight: 1.55 }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalActions} style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setSelectedProductReviewModal(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) { return <div className={styles.emptyTable}><span><Search size={19} /></span><strong>{title}</strong><p>{body}</p></div>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date); }
function createLocalId() { try { if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID(); } catch { /* Some local network origins do not expose randomUUID. */ } return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
function monthSeries(orders: AdminOrder[]) { const now = new Date(); return Array.from({ length: 6 }, (_, index) => { const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1); const label = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date); const total = orders.filter((order) => { const created = new Date(order.createdAt); return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth(); }).reduce((sum, order) => sum + order.total, 0); return { label, total }; }); }
function exportOrders(orders: AdminOrder[], sample = false) {
  const rows = [
    [
      sample ? "Sample order (preview only)" : "Order ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Delivery Address",
      "Items Count",
      "Items Purchased",
      "Date",
      "Payment Method",
      "Status",
      "Total Amount (INR)"
    ],
    ...orders.map((order) => {
      const itemsList = Array.isArray(order.items)
        ? order.items.map((it) => `${it.quantity}x ${it.name} (₹${it.price})`).join("; ")
        : "Standard Order";
      const itemsQty = Array.isArray(order.items)
        ? order.items.reduce((s, it) => s + (it.quantity || 1), 0)
        : 1;

      return [
        order.id,
        order.customer,
        order.customerEmail || "",
        order.customerPhone || "",
        order.customerAddress || "",
        String(itemsQty),
        itemsList,
        formatDate(order.createdAt),
        order.paymentMethod || "Online",
        order.status,
        order.total.toFixed(2),
      ];
    })
  ];
  return downloadCsv(sample ? "swachetna-sample-orders.csv" : `swachetna-orders-report-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}
function exportProducts(products: AdminProduct[]) { const rows = [["Product", "Collection", "SKU", "Price", "Stock", "Visibility"], ...products.map((product) => [product.name, product.category, product.sku, String(product.price), String(product.stock), product.status])]; downloadCsv("inventory.csv", rows); }
function downloadCsv(filename: string, rows: string[][]) { try { const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n")}`; const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.style.position = "fixed"; anchor.style.left = "-9999px"; document.body.appendChild(anchor); anchor.click(); window.setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 5000); return true; } catch { return false; } }
