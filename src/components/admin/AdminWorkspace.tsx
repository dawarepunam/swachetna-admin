"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Download, Eye, FileText, Filter, HeartHandshake, MoreHorizontal, Package, Plus, Printer, Search, Shapes, ShoppingCart, SlidersHorizontal, Sparkles, TrendingUp, Truck, Upload, Users, X } from "lucide-react";
import { formatCurrency } from "../../data/products";
import { useAdminData, type AdminCampaign, type AdminCategory, type AdminCoupon, type AdminOrder, type AdminProduct } from "./AdminData";
import styles from "./Admin.module.css";

type Section = "dashboard" | "products" | "inventory" | "orders" | "inquiries" | "coupons" | "reviews" | "customers" | "categories" | "reports" | "content" | "campaigns" | "settings";
const samplePreviewOrders: AdminOrder[] = [
  { id: "SAMPLE-1048", customer: "Aarohi Deshmukh", total: 2450, createdAt: "2026-10-16T10:30:00.000Z", status: "Processing", paymentMethod: "UPI" },
  { id: "SAMPLE-1047", customer: "Kabir Patil", total: 1890, createdAt: "2026-09-22T09:10:00.000Z", status: "Delivered", paymentMethod: "Card" },
  { id: "SAMPLE-1046", customer: "Meera Joshi", total: 3250, createdAt: "2026-08-14T12:45:00.000Z", status: "Shipped", paymentMethod: "UPI" },
  { id: "SAMPLE-1045", customer: "Ishan Kulkarni", total: 1460, createdAt: "2026-07-08T08:15:00.000Z", status: "Delivered", paymentMethod: "Cash on delivery" },
  { id: "SAMPLE-1044", customer: "Sana Shaikh", total: 2780, createdAt: "2026-06-19T11:20:00.000Z", status: "Delivered", paymentMethod: "Card" },
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
  const orderRecords = useMemo(() => data.orders.length ? data.orders : samplePreviewOrders.map((order) => ({ ...order, status: data.orderStatuses[order.id] ?? order.status })), [data.orders, data.orderStatuses]);
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

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    const updated = data.products.filter((item) => item.id !== product.id);
    data.setProducts(updated);
    const ok = await data.syncWorkspace({ products: updated });
    notify(ok ? "Product deleted from database." : "Product removed locally.");
  };

  const saveCategory = async (name: string, description: string, subcategories: string[]) => {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (data.categories.some((category) => category.slug === slug && category.slug !== editingCategory?.slug)) { notify("A collection with that name already exists."); return false; }
    const next: AdminCategory = { slug, name, description, subcategories };
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

    {section === "dashboard" && <>{data.ready && data.orders.length === 0 && <div className={styles.demoBanner}><span><Sparkles size={14} /> SAMPLE DATA</span><p>Preview orders help explain this dashboard. They are examples only and are not saved as real sales.</p></div>}<Dashboard products={data.products} orders={data.orders.length ? data.orders : samplePreviewOrders} isPreview={!data.orders.length} onQuick={() => setQuickActions((value) => !value)} quickOpen={quickActions} /></>}
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
    {section === "orders" && <>{data.ready && data.orders.length === 0 && <div className={styles.demoBanner}><span><Sparkles size={14} /> SAMPLE ORDERS</span><p>These example orders are for preview only. They are not real purchases and are not saved as store orders.</p></div>}<OrdersSection orders={visibleOrders} isPreview={!data.orders.length} search={search} onSearch={setSearch} status={statusFilter} onStatusFilter={setStatusFilter} onStatus={(id, status) => data.setOrderStatus(id, status)} onExport={() => exportOrders(orderRecords)} onSelectOrder={(order) => setSelectedOrder(order)} /></>}
    {section === "coupons" && <CouponsSection coupons={data.coupons} onSave={(updated) => data.syncWorkspace({ coupons: updated })} />}
    {section === "reviews" && <ReviewsSection products={data.products} onSaveProducts={(updated) => data.syncWorkspace({ products: updated })} />}
    {section === "inquiries" && <InquiriesSection inquiries={data.inquiries} onStatus={(id, status) => data.setInquiryStatus(id, status)} />}
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

function Dashboard({ products, orders, isPreview, onQuick, quickOpen }: { products: AdminProduct[]; orders: AdminOrder[]; isPreview: boolean; onQuick: () => void; quickOpen: boolean }) {
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
    { label: "Delivered", description: "Successfully completed", value: delivered, icon: CheckCircle2, className: styles.fulfillmentDelivered },
    { label: "In progress", description: "Processing and pending", value: pending, icon: Clock3, className: styles.fulfillmentPending },
    { label: "Shipped", description: "On the way", value: shipped, icon: Truck, className: styles.fulfillmentShipped },
  ];
  const metricData = [
    { label: isPreview ? "Sample revenue" : "Recorded revenue", value: formatCurrency(revenue), delta: isPreview ? "Preview only ? not real sales" : `${orders.length} recorded orders`, icon: TrendingUp, tint: "purple" },
    { label: "Orders", value: String(orders.length), delta: isPreview ? "Sample records for preview" : `${pending} need attention`, icon: Package, tint: "peach" },
    { label: "Customers", value: String(customers), delta: isPreview ? "Example customer records" : "Based on recorded orders", icon: Users, tint: "blue" },
    { label: isPreview ? "Sample average" : "Average order", value: formatCurrency(average), delta: isPreview ? "Example value only" : "Calculated from recorded orders", icon: ShoppingCart, tint: "green" },
  ];
  return <>
    <section className={styles.metrics}>{metricData.map(({ label, value, delta, icon: Icon, tint }) => <article className={styles.metricCard} key={label}><div className={styles.metricTop}><span>{label}</span><span className={`${styles.metricIcon} ${styles[tint]}`}><Icon size={17} /></span></div><div className={styles.metricValue}>{value}</div><div className={styles.metricFoot}>{delta}</div></article>)}</section>
    <div className={styles.dashboardGrid}>
      <section className={`${styles.panel} ${styles.revenuePanel}`}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>{isPreview ? "SAMPLE ORDER DATA" : "ORDER RECORDS"}</span><h2>Revenue by month</h2></div><span className={styles.dataSource}><CalendarDays size={13} /> {isPreview ? "Preview sample" : "Last 6 months"}</span></div><div className={styles.chartSummary}><strong>{formatCurrency(revenue)}</strong><span>{orders.length} orders</span></div><div className={styles.chart}><div className={styles.chartLabels}><span>{formatCurrency(maxRevenue)}</span><span>{formatCurrency(maxRevenue * .75)}</span><span>{formatCurrency(maxRevenue * .5)}</span><span>{formatCurrency(maxRevenue * .25)}</span><span>₹ 0</span></div><div className={styles.chartPlot}><div className={styles.chartGuides}><i /><i /><i /><i /><i /></div><div className={styles.liveBars}>{months.map((month) => { const barHeight = month.total ? Math.max(4, (month.total / maxRevenue) * 78) : 0; return <div className={styles.liveBarColumn} key={month.label} title={`${month.label}: ${formatCurrency(month.total)}`}><strong className={styles.liveBarValue} style={{ bottom: `calc(${barHeight}% + 4px)` }}>{formatCurrency(month.total)}</strong><span style={{ height: `${barHeight}%` }} /><small>{month.label}</small></div>; })}</div></div></div><p className={styles.chartNote}><span className={styles.chartNoteDot} /><strong>{isPreview ? "Preview data" : "Recorded data"}</strong><span>{isPreview ? "Sample amounts are shown for layout preview only; they are not real sales." : "Amounts are calculated from orders saved in this browser."}</span></p></section>
      <section className={`${styles.panel} ${styles.orderPanel}`} aria-labelledby="order-status-heading">
        <div className={styles.panelHeading}>
          <div><span className={styles.eyebrow}>FULFILMENT</span><h2 id="order-status-heading">Order status</h2></div>
          <span className={styles.fulfillmentTotal}>{totalOrders} total</span>
        </div>
        <div className={styles.fulfillmentSummary}>
          <div className={styles.fulfillmentSummaryText}><span>Order distribution</span><strong>{totalOrders ? `${totalOrders} orders` : "No orders yet"}</strong></div>
          <div className={styles.fulfillmentTrack} role="img" aria-label={`${delivered} delivered, ${pending} in progress, ${shipped} shipped`}>
            <span className={styles.fulfillmentDelivered} style={{ width: `${totalOrders ? (delivered / totalOrders) * 100 : 0}%` }} />
            <span className={styles.fulfillmentPending} style={{ width: `${totalOrders ? (pending / totalOrders) * 100 : 0}%` }} />
            <span className={styles.fulfillmentShipped} style={{ width: `${totalOrders ? (shipped / totalOrders) * 100 : 0}%` }} />
          </div>
        </div>
        <div className={styles.fulfillmentList}>{fulfillmentStatuses.map(({ label, description, value, icon: Icon, className }) => <article className={styles.fulfillmentItem} key={label}>
          <span className={`${styles.fulfillmentIcon} ${className}`}><Icon size={16} /></span>
          <span className={styles.fulfillmentCopy}><strong>{label}</strong><small>{description}</small></span>
          <strong className={styles.fulfillmentCount}>{value}</strong>
        </article>)}</div>
      </section>
      <section className={`${styles.panel} ${styles.recentPanel}`}><div className={styles.panelHeading}><div><span className={styles.eyebrow}>{isPreview ? "SAMPLE RECORDS" : "LATEST RECORDS"}</span><h2>Recent orders</h2></div><Link href="/admin/orders">View orders <ArrowUpRight size={14} /></Link></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th className={styles.alignRight}>TOTAL</th></tr></thead><tbody>{[...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((order) => <tr key={order.id}><td><strong className={styles.orderId}>{order.id}</strong></td><td><span className={styles.customerName}>{order.customer}</span></td><td>{formatDate(order.createdAt)}</td><td><StatusBadge status={order.status} /></td><td className={styles.alignRight}><strong>{formatCurrency(order.total)}</strong></td></tr>)}</tbody></table></div></section>
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

function OrdersSection({ orders, isPreview, search, onSearch, status, onStatusFilter, onStatus, onExport, onSelectOrder }: { orders: AdminOrder[]; isPreview: boolean; search: string; onSearch: (value: string) => void; status: string; onStatusFilter: (value: string) => void; onStatus: (id: string, status: AdminOrder["status"]) => void; onExport: () => void; onSelectOrder: (order: AdminOrder) => void }) {
  return <><div className={styles.statStrip}><div><span>{isPreview ? "Sample orders" : "Orders on this browser"}</span><strong>{orders.length}</strong></div><div><span>Pending</span><strong>{orders.filter((item) => item.status === "Pending").length}</strong></div><div><span>Processing</span><strong>{orders.filter((item) => item.status === "Processing").length}</strong></div><div><span>Delivered</span><strong>{orders.filter((item) => item.status === "Delivered").length}</strong></div></div><section className={styles.panel}><div className={styles.tableToolbar}><div className={styles.tableSearch}><Search size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search order reference or customer..." /></div><div className={styles.toolbarActions}><select className={styles.filterSelect} value={status} onChange={(event) => onStatusFilter(event.target.value)}><option>All statuses</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option></select><button type="button" className={styles.secondaryButton} onClick={onExport}><Download size={15} /> {isPreview ? "Export sample" : "Export"}</button></div></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>PAYMENT</th><th>STATUS</th><th className={styles.alignRight}>TOTAL</th><th>ACTIONS</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><button type="button" onClick={() => onSelectOrder(order)} style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}><strong className={styles.orderId} style={{ color: "#7652c8", textDecoration: "underline" }}>{order.id}</strong></button></td><td><span className={styles.customerName}>{order.customer}</span></td><td>{formatDate(order.createdAt)}</td><td>{order.paymentMethod || "Not recorded"}</td><td><select className={`${styles.statusSelect} ${styles[`status${order.status}`]}`} value={order.status} onChange={(event) => onStatus(order.id, event.target.value as AdminOrder["status"])} aria-label={`Status for ${order.id}`}><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option></select></td><td className={styles.alignRight}><strong>{formatCurrency(order.total)}</strong></td><td><button type="button" className={styles.iconButton} onClick={() => onSelectOrder(order)} title="View order invoice & details"><Eye size={15} /></button></td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState title="No matching orders" body="Change the search or status filter to see orders." />}</div></section></>;
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
        <h2>{category.name}</h2>
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
  const [variantsList, setVariantsList] = useState<Array<{ name: string; hex: string; images: string[] }>>(() => {
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      return product.variants.map((v) => ({
        name: v.name || "",
        hex: v.hex || "#7451ba",
        images: Array.isArray(v.images) ? v.images : []
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
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        setVariantsList(product.variants.map((v) => ({
          name: v.name || "",
          hex: v.hex || "#7451ba",
          images: Array.isArray(v.images) ? v.images : []
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
      setStatus("Published");
      setImage("");
      setGalleryImages([]);
      setColorsText("");
      setSizesText("");
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
        image: mainImg,
        images,
        colors,
        sizes,
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
function CategoryDialog({ category, onClose, onSave }: { category: AdminCategory | null; onClose: () => void; onSave: (name: string, description: string, subcategories: string[]) => boolean | Promise<boolean> }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [subcategoriesText, setSubcategoriesText] = useState(
    Array.isArray(category?.subcategories) 
      ? category.subcategories.join(", ") 
      : (category?.subcategories || "")
  );
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
    } else {
      setName("");
      setDescription("");
      setSubcategoriesText("");
    }
  }, [category]);
  return <div className={styles.modalScrim} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section id="category-dialog" className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="category-dialog-title"><div className={styles.modalHead}><div><span className={styles.eyebrow}>COLLECTIONS</span><h2 id="category-dialog-title">{category ? "Edit collection" : "Add collection"}</h2><p>Give your product collection a clear name, description and sub-collections.</p></div><button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close"><X size={18} /></button></div><form className={styles.modalForm} onSubmit={(event) => { 
    event.preventDefault(); 
    const subs = subcategoriesText.split(",").map((s) => s.trim()).filter(Boolean);
    if (!onSave(name.trim(), description.trim(), subs)) setError("A collection with this name already exists."); 
  }}><label>Collection name<input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Food & NGO Products" required maxLength={80} /></label><label>Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description of this collection..." required maxLength={240} /></label><label>Sub-collections <small className={styles.formHint}>(Separate by comma, e.g. Pickle, Dryfruit Laddu, Papad)</small><input value={subcategoriesText} onChange={(event) => setSubcategoriesText(event.target.value)} placeholder="Pickle, Dryfruit Laddu, Papad, Spices" maxLength={300} /></label>{error && <p className={styles.formError} role="alert">{error}</p>}<div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button type="submit" className={styles.primaryButton}>{category ? "Save changes" : "Add collection"} <Check size={15} /></button></div></form></section></div>;
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

function InquiriesSection({ inquiries, onStatus }: { inquiries: any[]; onStatus: (id: string, status: "New" | "Read" | "Responded") => void }) {
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  return (
    <>
      <div className={styles.statStrip}>
        <div><span>Total Inquiries</span><strong>{inquiries.length}</strong></div>
        <div><span>New</span><strong className={styles.warningText}>{inquiries.filter((i) => i.status === "New").length}</strong></div>
        <div><span>Read</span><strong>{inquiries.filter((i) => i.status === "Read").length}</strong></div>
        <div><span>Responded</span><strong>{inquiries.filter((i) => i.status === "Responded").length}</strong></div>
      </div>

      <section className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>FROM</th>
                <th>CONTACT</th>
                <th>SUBJECT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td><strong>{inq.name}</strong></td>
                  <td>
                    <div><a href={`mailto:${inq.email}`} style={{ color: "#7652c8" }}>{inq.email}</a></div>
                    {inq.phone && <small style={{ color: "#8a8197" }}>📞 {inq.phone}</small>}
                  </td>
                  <td><strong>{inq.subject || "General inquiry"}</strong></td>
                  <td>{formatDate(inq.createdAt)}</td>
                  <td>
                    <select
                      className={styles.filterSelect}
                      value={inq.status}
                      onChange={(e) => onStatus(inq.id, e.target.value as any)}
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
                      onClick={() => {
                        setSelectedInquiry(inq);
                        if (inq.status === "New") onStatus(inq.id, "Read");
                      }}
                    >
                      <Eye size={14} /> Read
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 && <EmptyState title="No inquiries yet" body="Customer messages submitted through the contact page will appear here." />}
        </div>
      </section>

      {selectedInquiry && (
        <div className={styles.modalScrim} role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedInquiry(null); }}>
          <section className={`${styles.modal} ${styles.orderModal}`} role="dialog" aria-modal="true">
            <div className={styles.modalHead}>
              <div>
                <span className={styles.eyebrow}>CUSTOMER MESSAGE</span>
                <h2>{selectedInquiry.subject || "Inquiry Details"}</h2>
                <p>From {selectedInquiry.name} · {formatDate(selectedInquiry.createdAt)}</p>
              </div>
              <button type="button" className={styles.iconButton} onClick={() => setSelectedInquiry(null)}><X size={18} /></button>
            </div>
            <div className={styles.orderSectionBlock}>
              <h4>Contact Information</h4>
              <p>Email: <a href={`mailto:${selectedInquiry.email}`} style={{ color: "#7652c8", fontWeight: 600 }}>{selectedInquiry.email}</a></p>
              {selectedInquiry.phone && <p>Phone: <strong>{selectedInquiry.phone}</strong></p>}
            </div>
            <div className={styles.orderSectionBlock}>
              <h4>Message Content</h4>
              <div className={styles.orderAddressBox} style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{selectedInquiry.message}</div>
            </div>
            <div className={styles.modalActions}>
              <a href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Your inquiry')}`} className={styles.primaryButton}>
                Reply via Email ✉️
              </a>
              <button type="button" className={styles.secondaryButton} onClick={() => setSelectedInquiry(null)}>Close</button>
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

  return (
    <>
      <section className={styles.panel} style={{ marginBottom: "20px" }}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>CREATE NEW PROMOTION</span>
            <h2>Create Discount Coupon</h2>
            <p>Add promo codes that customers can apply during checkout.</p>
          </div>
        </div>

        <form onSubmit={handleAddCoupon} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginTop: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Coupon Code (e.g. SWACHETNA10)
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FESTIVE20"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d4c8db", textTransform: "uppercase", fontWeight: "700" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d4c8db", background: "#fff" }}
            >
              <option value="percentage">Percentage (%) Off</option>
              <option value="fixed">Flat Amount (₹) Off</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
              Discount Value {discountType === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 150"}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d4c8db" }}
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
              placeholder="e.g. 500"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d4c8db" }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#5d456f", display: "block", marginBottom: "4px" }}>
                Description / Purpose
              </label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. 15% discount for Diwali celebration"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d4c8db" }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className={styles.primaryButton}
              style={{ minHeight: "42px", padding: "0 22px" }}
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
            <h2>Coupons List ({list.length})</h2>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>COUPON CODE</th>
                <th>DISCOUNT</th>
                <th>MIN ORDER</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontSize: "13px", color: "#4f2b66", letterSpacing: "0.05em", background: "#f5edf8", padding: "4px 10px", borderRadius: "6px", border: "1px dashed #d5bddc" }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <strong>{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}</strong>
                  </td>
                  <td>
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : "None"}
                  </td>
                  <td style={{ color: "#6a5e73", fontSize: "12px" }}>
                    {c.description || "General promotion"}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c.id)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "99px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: "1px solid currentColor",
                        background: c.status === "Active" ? "#eef8f2" : "#fbf9fc",
                        color: c.status === "Active" ? "#1a8f4c" : "#8a7e93"
                      }}
                    >
                      {c.status}
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
          {list.length === 0 && (
            <EmptyState title="No coupons created yet" body="Create a promo code above to offer discounts on your storefront." />
          )}
        </div>
      </section>
    </>
  );
}

function ReviewsSection({ products, onSaveProducts }: { products: AdminProduct[]; onSaveProducts: (products: AdminProduct[]) => Promise<boolean> }) {
  // Aggregate all reviews across products
  const allReviewsWithProduct = useMemo(() => {
    const list: Array<{ productSlug: string; productName: string; review: any }> = [];
    products.forEach((p) => {
      if (Array.isArray(p.reviews)) {
        p.reviews.forEach((r) => {
          list.push({ productSlug: p.slug, productName: p.name, review: r });
        });
      }
    });
    return list;
  }, [products]);

  const [filterRating, setFilterRating] = useState("all");

  const handleDeleteReview = async (productSlug: string, reviewId: string) => {
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

  return (
    <>
      <div className={styles.statStrip}>
        <div><span>Total Reviews</span><strong>{allReviewsWithProduct.length}</strong></div>
        <div><span>5 Stars</span><strong>{allReviewsWithProduct.filter((r) => r.review.rating === 5).length}</strong></div>
        <div><span>4 Stars</span><strong>{allReviewsWithProduct.filter((r) => r.review.rating === 4).length}</strong></div>
        <div><span>Products with Reviews</span><strong>{products.filter((p) => p.reviews && p.reviews.length > 0).length}</strong></div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <span className={styles.eyebrow}>CUSTOMER RATINGS &amp; TESTIMONIALS</span>
            <h2>Product Reviews Moderation</h2>
            <p>Customer reviews submitted directly from product detail pages.</p>
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
                <th>COMMENT</th>
                <th>DATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ productSlug, productName, review }) => (
                <tr key={review.id || `${productSlug}-${review.author}`}>
                  <td>
                    <strong style={{ fontSize: "12px", color: "#3a2d42" }}>{productName}</strong>
                    <div style={{ fontSize: "10px", color: "#8a7e93" }}>{productSlug}</div>
                  </td>
                  <td>
                    <strong>{review.author}</strong>
                    {review.verified && (
                      <span style={{ fontSize: "10px", color: "#1a8f4c", display: "block" }}>✓ Verified Buyer</span>
                    )}
                  </td>
                  <td>
                    <div style={{ color: "#f59e0b", display: "flex", gap: "2px" }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ opacity: i < review.rating ? 1 : 0.3 }}>★</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: "340px", fontSize: "12px", color: "#54465b" }}>
                    &ldquo;{review.comment}&rdquo;
                  </td>
                  <td style={{ fontSize: "11px", color: "#8a7e93" }}>
                    {review.date || "Recent"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handleDeleteReview(productSlug, review.id)}
                      title="Delete review"
                    >
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState title="No reviews found" body="Customer reviews submitted on product pages will appear here for management." />
          )}
        </div>
      </section>
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
