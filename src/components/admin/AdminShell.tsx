"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, BookOpenText, Boxes, BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, FileBarChart, HeartHandshake, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Package, Search, Settings, Shapes, ShoppingCart, Star, Tag, Users, X } from "lucide-react";
import { AdminDataProvider } from "./AdminData";
import { isAdminLoggedIn, adminLogout } from "./AdminLogin";
import styles from "./Admin.module.css";

const navigation = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, group: "WORKSPACE" },
  { label: "Products", href: "/admin/products", icon: Package, group: "WORKSPACE" },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes, group: "WORKSPACE" },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, group: "WORKSPACE" },
  { label: "Coupons & Discounts", href: "/admin/coupons", icon: Tag, group: "WORKSPACE" },
  { label: "Customer Reviews", href: "/admin/reviews", icon: Star, group: "WORKSPACE" },
  { label: "Inquiries", href: "/admin/inquiries", icon: Mail, group: "WORKSPACE" },
  { label: "Customers", href: "/admin/customers", icon: Users, group: "WORKSPACE" },
  { label: "Categories", href: "/admin/categories", icon: Shapes, group: "WORKSPACE" },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart, group: "INSIGHTS" },
  { label: "Website content", href: "/admin/content", icon: BookOpenText, group: "FOUNDATION" },
  { label: "Campaigns", href: "/admin/campaigns", icon: HeartHandshake, group: "FOUNDATION" },
  { label: "Settings", href: "/admin/settings", icon: Settings, group: "PREFERENCES" },
];
const pageNames: Record<string, string> = { "/admin/dashboard": "Overview", "/admin/products": "Products", "/admin/inventory": "Inventory", "/admin/orders": "Orders", "/admin/coupons": "Coupons & Discounts", "/admin/reviews": "Customer Reviews", "/admin/inquiries": "Inquiries", "/admin/customers": "Customers", "/admin/categories": "Categories", "/admin/reports": "Reports", "/admin/content": "Website content", "/admin/campaigns": "Campaigns", "/admin/settings": "Settings" };

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    const toggle = document.getElementById("admin-mobile-nav-toggle") as HTMLInputElement | null;
    if (toggle) toggle.checked = false;
    if (window.location.hash === "#admin-navigation-panel") window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  };

  useEffect(() => {
    if (pathname === "/admin/login") { setAuthChecked(true); return; }
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login");
    } else {
      setAuthChecked(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    adminLogout();
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authChecked) return null;

  const groups = [...new Set(navigation.map((item) => item.group))];

  return <AdminDataProvider><div className={`${styles.admin} ${collapsed ? styles.collapsed : ""}`}>
    <input id="admin-mobile-nav-toggle" className={styles.mobileNavToggle} type="checkbox" checked={mobileOpen} onChange={(event) => setMobileOpen(event.target.checked)} aria-label="Toggle admin navigation" />
    <label htmlFor="admin-mobile-nav-toggle" className={`${styles.scrim} ${mobileOpen ? styles.scrimOpen : ""}`} aria-label="Close navigation" />
    <aside id="admin-navigation-panel" className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.brandRow}><Link href="/admin/dashboard" className={styles.brand} aria-label="Swachetna admin overview"><Image src="/images/swachetna-purple.webp" alt="Swachetna Foundation" width={320} height={120} priority className={styles.brandImage} /><span className={styles.brandCopy}><small>FOUNDATION ADMIN</small></span></Link><label htmlFor="admin-mobile-nav-toggle" className={styles.closeMobile} aria-label="Close navigation menu" title="Close menu"><X size={19} /></label></div>
      <div className={styles.workspacePicker}><span className={styles.workspaceIcon}><BriefcaseBusiness size={16} /></span><span><strong>Swachetna Foundation</strong><small>Admin workspace</small></span><ChevronDown size={15} /></div>
      <nav className={styles.sideNav} aria-label="Admin navigation">{groups.map((group) => <div className={styles.navGroup} key={group}><span className={styles.navGroupLabel}>{group}</span>{navigation.filter((item) => item.group === group).map(({ label, href, icon: Icon }) => { const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={closeMobileMenu} className={`${styles.navLink} ${active ? styles.navActive : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined}><Icon size={18} strokeWidth={active ? 2.1 : 1.8} /><span>{label}</span></Link>; })}</div>)}</nav>
      <div className={styles.sidebarBottom}><div
        className={styles.helpCard}
        onClick={() => setHelpOpen(true)}
        style={{ cursor: "pointer", userSelect: "none" }}
        role="button"
        tabIndex={0}
        title="Click to open Help Center & Seller Support"
      >
        <span className={styles.helpIcon}><CircleHelp size={16} /></span>
        <span><strong>Need a hand?</strong><small>Visit the help center</small></span>
        <ChevronRight size={15} />
      </div><div className={styles.sidebarFoot}><span className={styles.onlineDot} /> Local workspace <span className={styles.version}>v1.0</span></div></div>
      <button className={styles.collapseButton} type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
    </aside>
    <div className={styles.mainColumn}>
      <header className={styles.topbar}><div className={styles.topbarLeft}><label htmlFor="admin-mobile-nav-toggle" className={styles.mobileMenu} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); document.getElementById("admin-mobile-nav-toggle")?.click(); } }} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="admin-navigation-panel"><Menu size={20} /></label><div className={styles.breadcrumb}><span>Workspace</span><ChevronRight size={14} /><strong>{pageNames[pathname] ?? "Admin workspace"}</strong></div></div>
        <div className={styles.topbarActions}><label className={styles.globalSearch}><Search size={16} /><input aria-label="Search admin" placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
          <button type="button" onClick={handleLogout} className={`${styles.iconButton} ${styles.logoutIcon}`} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
          <span className={styles.topbarDivider} /><div className={styles.popoverWrap}><button type="button" className={styles.profileButton} aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}><span className={styles.avatar}>AD</span><span className={styles.profileText}><strong>Workspace admin</strong><small>Administrator</small></span><ChevronDown size={14} /></button>{profileOpen && <div className={styles.popover}><strong>Workspace admin</strong><small>Local workspace access</small><button type="button" onClick={handleLogout} className={styles.popoverAction}><LogOut size={15} /> Sign out</button></div>}</div>
        </div></header>
      <main className={styles.content}>{children}<footer className={styles.pageFoot}><span><Activity size={13} /> Local workspace · Changes stay in this browser</span><span>© 2026 Swachetna Foundation</span></footer></main>
    </div>

    {/* Amazon / Nykaa Partner Style Help Center & Support Desk Modal */}
    {helpOpen && (
      <div
        className={styles.modalScrim}
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setHelpOpen(false);
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
              <span className={styles.eyebrow}>FOUNDATION SUPPORT &amp; HELP DESK</span>
              <h2 style={{ fontSize: "20px", color: "#2d1c3e", marginTop: "2px" }}>
                Admin Help Center &amp; Guides
              </h2>
              <p style={{ fontSize: "13px", color: "#776b85" }}>
                Instant operational guides, fast shortcuts, and technical assistance for Swachetna Foundation.
              </p>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setHelpOpen(false)}
              aria-label="Close help center"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Action Hub */}
          <div style={{ marginTop: "16px" }}>
            <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#604775", marginBottom: "10px" }}>
              ⚡ Fast Workspace Shortcuts
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              <Link
                href="/admin/products/new"
                onClick={() => setHelpOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "#fbf9fd",
                  border: "1px solid #ebddee",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "#312140",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                <Package size={18} color="#7451ba" />
                <span>Add New Product</span>
              </Link>

              <Link
                href="/admin/coupons"
                onClick={() => setHelpOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "#fbf9fd",
                  border: "1px solid #ebddee",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "#312140",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                <Tag size={18} color="#b45309" />
                <span>Create Promo Code</span>
              </Link>

              <Link
                href="/admin/inquiries"
                onClick={() => setHelpOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "#fbf9fd",
                  border: "1px solid #ebddee",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "#312140",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                <Mail size={18} color="#166534" />
                <span>Customer Inquiries</span>
              </Link>
            </div>
          </div>

          {/* Operation FAQ Guides */}
          <div style={{ marginTop: "22px" }}>
            <h4 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#604775", marginBottom: "10px" }}>
              📖 Common Questions &amp; Operational Guides
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <details style={{ background: "#ffffff", border: "1px solid #ede4f2", borderRadius: "10px", padding: "12px 16px", cursor: "pointer" }}>
                <summary style={{ fontWeight: "700", color: "#362447", fontSize: "13.5px" }}>
                  📦 How to pack, dispatch, and mark an order as &ldquo;Delivered&rdquo;?
                </summary>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#665775", lineHeight: 1.55 }}>
                  Go to <strong>Orders (/admin/orders)</strong>, click on the order reference to view the customer delivery address and products. Once packed, change status to <strong>Shipped</strong>. When courier delivers to customer, change status to <strong>Delivered</strong>.
                </p>
              </details>

              <details style={{ background: "#ffffff", border: "1px solid #ede4f2", borderRadius: "10px", padding: "12px 16px", cursor: "pointer" }}>
                <summary style={{ fontWeight: "700", color: "#362447", fontSize: "13.5px" }}>
                  🎟️ How do discount promo coupons work during Checkout?
                </summary>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#665775", lineHeight: 1.55 }}>
                  Go to <strong>Coupons &amp; Discounts</strong> and enter a code (e.g. FESTIVE20), set percentage or flat ₹ discount, and minimum cart requirement. When active, customers can type this code in the Bag and Checkout to receive instant discount.
                </p>
              </details>

              <details style={{ background: "#ffffff", border: "1px solid #ede4f2", borderRadius: "10px", padding: "12px 16px", cursor: "pointer" }}>
                <summary style={{ fontWeight: "700", color: "#362447", fontSize: "13.5px" }}>
                  ✉️ How to reply to customer inquiries via Gmail?
                </summary>
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#665775", lineHeight: 1.55 }}>
                  Open <strong>Inquiries</strong>, click on any customer row. You can type an official response that displays on the customer profile, or click <strong>Compose in Gmail</strong> to send an email directly using your Google account.
                </p>
              </details>
            </div>
          </div>

          {/* Direct Support & WhatsApp Contact */}
          <div style={{ marginTop: "24px", background: "linear-gradient(135deg, #f7f2fb, #ede5f7)", border: "1.5px solid #dfd1ee", borderRadius: "12px", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#321d42", display: "block" }}>
                  Still need assistance with your workspace?
                </strong>
                <span style={{ fontSize: "12px", color: "#746485" }}>
                  Connect with technical team or Swachetna Foundation helpdesk.
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href="https://api.whatsapp.com/send?phone=918856017832&text=Hello%20Swachetna%20Foundation%20Support%2C%20I%20need%20help%20with%20the%20Admin%20Workspace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryButton}
                  style={{ fontSize: "12px", padding: "8px 14px", background: "#25D366", borderColor: "#1ebd58", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  WhatsApp Support 💬
                </a>
                <a
                  href="mailto:dawarepunam82@gmail.com?subject=Swachetna%20Foundation%20Admin%20Support%20Request"
                  className={styles.secondaryButton}
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                >
                  Email Helpdesk ✉️
                </a>
              </div>
            </div>
          </div>

          <div className={styles.modalActions} style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setHelpOpen(false)}
            >
              Close Help Center
            </button>
          </div>
        </section>
      </div>
    )}
  </div></AdminDataProvider>;
}
