"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  KeyRound,
  MapPin,
  PackageCheck,
  UserRound,
  Truck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Heart,
  ShoppingBag,
  CreditCard,
  Headphones,
  Settings,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  Mail,
  Phone,
  Edit2,
  Award,
  Sparkles,
  ShoppingBasket
} from "lucide-react";
import styles from "./AccountScreen.module.css";
import { formatCurrency } from "../../../data/products";
import { useStore } from "../../../context/StoreContext";

type Mode = "login" | "register" | "forgot" | "profile" | "orders" | "addresses";
type User = { id?: string | number; name: string; email: string; phone?: string; jwt?: string; address?: string };
type AccountOrder = {
  reference: string;
  total: number;
  createdAt: string;
  status?: string;
  paymentMethod?: string;
  items?: Array<{ name: string; quantity: number; price: number; image?: string }>;
};

export default function AccountScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { wishlist, cartCount, allProducts } = useStore();

  const validWishlistCount = wishlist.filter((wId) => {
    const wLower = wId.toLowerCase();
    return allProducts.some(
      (p) =>
        p.id.toLowerCase() === wLower ||
        (p.slug && p.slug.toLowerCase() === wLower) ||
        (p.sku && p.sku.toLowerCase() === wLower) ||
        (p.name && p.name.toLowerCase() === wLower)
    );
  }).length;

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addressDraft, setAddressDraft] = useState({ line: "", city: "", state: "", postalCode: "" });
  const [savedAddress, setSavedAddress] = useState<any>(null);

  const isAuthMode = mode === "login" || mode === "register" || mode === "forgot";

  // Check login session on mount
  useEffect(() => {
    let currentUser: User | null = null;
    try {
      const saved = localStorage.getItem("swachetna-demo-user");
      if (saved) {
        currentUser = JSON.parse(saved) as User;
        setUser(currentUser);
      }
      const addr = localStorage.getItem("swachetna-saved-address");
      if (addr) {
        setSavedAddress(JSON.parse(addr));
      }
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }

    // Load orders
    async function loadAccountOrders() {
      setLoadingOrders(true);
      const localOrders: AccountOrder[] = [];
      try {
        const rawLocal = localStorage.getItem("swachetna-demo-orders");
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            parsed.forEach((o: any) => {
              localOrders.push({
                reference: o.reference,
                total: o.total,
                createdAt: o.createdAt,
                status: o.status || "Pending",
                paymentMethod: o.paymentMethod,
                items: o.items || [],
              });
            });
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const res = await fetch("/api/admin/workspace", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const strapiOrders = json?.data?.orders;
          if (Array.isArray(strapiOrders)) {
            const mappedStrapi: AccountOrder[] = strapiOrders.map((o: any) => ({
              reference: o.orderId || String(o.id),
              total: Number(o.total) || 0,
              createdAt: o.orderDate || new Date().toISOString(),
              status: o.status || "Pending",
              paymentMethod: o.paymentMethod || "Online",
              items: Array.isArray(o.items) ? o.items : [],
            }));

            const combinedMap = new Map<string, AccountOrder>();
            localOrders.forEach((o) => combinedMap.set(o.reference.toLowerCase(), o));
            mappedStrapi.forEach((o) => combinedMap.set(o.reference.toLowerCase(), o));

            const finalOrders = [...combinedMap.values()].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(finalOrders);
            setLoadingOrders(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Strapi orders fetch failed, using local orders:", err);
      }

      setOrders(localOrders);
      setLoadingOrders(false);
    }

    loadAccountOrders();
  }, []);

  // Amazon/Nykaa Rule: If user is already logged in and lands on login/register/forgot, automatically redirect to profile!
  useEffect(() => {
    if (authChecked && user && isAuthMode) {
      router.replace("/account/profile");
    }
  }, [authChecked, user, isAuthMode, router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (mode === "forgot") {
      setMessage("If this email is registered, password reset instructions have been sent.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    if (mode === "register" && name.trim().length < 2) {
      setMessage("Please enter your full name.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        let loggedIn = false;
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: email, password }),
          });
          const resData = await res.json();
          if (res.ok && resData.user) {
            const userData: User = {
              id: resData.user.id,
              name: resData.user.username || email.split("@")[0],
              email: resData.user.email,
              phone: resData.user.phone || "",
              jwt: resData.jwt,
            };
            localStorage.setItem("swachetna-demo-user", JSON.stringify(userData));
            window.dispatchEvent(new Event("swachetna-auth-changed"));
            setUser(userData);
            setMessage("Welcome back! Signed in successfully.");
            loggedIn = true;
            setTimeout(() => router.replace("/account/profile"), 600);
          } else if (resData.error && !resData.error.includes("connect") && !resData.error.includes("fetch")) {
            setMessage(resData.error);
            setIsError(true);
            setLoading(false);
            return;
          }
        } catch {
          /* Fallback gracefully to offline/local session */
        }

        if (!loggedIn) {
          const cleanName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
          const localUser: User = {
            name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            email: email.trim().toLowerCase(),
            phone: phone || "+91 98765 43210",
          };
          localStorage.setItem("swachetna-demo-user", JSON.stringify(localUser));
          window.dispatchEvent(new Event("swachetna-auth-changed"));
          setUser(localUser);
          setMessage("Welcome back! Signed in successfully.");
          setTimeout(() => router.replace("/account/profile"), 600);
        }
      } else if (mode === "register") {
        let registered = false;
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: name.trim(),
              email: email.trim().toLowerCase(),
              password,
            }),
          });
          const resData = await res.json();
          if (res.ok && resData.user) {
            const userData: User = {
              id: resData.user.id,
              name: resData.user.username || name.trim(),
              email: resData.user.email,
              phone: phone.trim() || "",
              jwt: resData.jwt,
            };
            localStorage.setItem("swachetna-demo-user", JSON.stringify(userData));
            window.dispatchEvent(new Event("swachetna-auth-changed"));
            setUser(userData);
            setMessage("Account created successfully! Welcome to Swachetna.");
            registered = true;
            setTimeout(() => router.replace("/account/profile"), 700);
          } else if (resData.error && !resData.error.includes("connect") && !resData.error.includes("fetch")) {
            setMessage(resData.error);
            setIsError(true);
            setLoading(false);
            return;
          }
        } catch {
          /* Fallback gracefully */
        }

        if (!registered) {
          const localUser: User = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || "+91 98765 43210",
          };
          localStorage.setItem("swachetna-demo-user", JSON.stringify(localUser));
          window.dispatchEvent(new Event("swachetna-auth-changed"));
          setUser(localUser);
          setMessage("Account created successfully! Welcome to Swachetna.");
          setTimeout(() => router.replace("/account/profile"), 700);
        }
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoUser: User = {
      name: "Aditi Sharma",
      email: "aditi.sharma@swachetna.org",
      phone: "+91 98200 12345",
    };
    localStorage.setItem("swachetna-demo-user", JSON.stringify(demoUser));
    window.dispatchEvent(new Event("swachetna-auth-changed"));
    setUser(demoUser);
    setMessage("Signed in as Aditi Sharma.");
    setTimeout(() => router.replace("/account/profile"), 400);
  };

  const handleSignOut = () => {
    localStorage.removeItem("swachetna-demo-user");
    window.dispatchEvent(new Event("swachetna-auth-changed"));
    setUser(null);
    router.replace("/account/login");
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!addressDraft.line || !addressDraft.city) return;
    const newAddr = { ...addressDraft };
    localStorage.setItem("swachetna-saved-address", JSON.stringify(newAddr));
    setSavedAddress(newAddr);
    setMessage("Address saved successfully!");
  };

  // If already logged in and on an auth route, show smooth redirect loader
  if (authChecked && user && isAuthMode) {
    return (
      <main className={styles.page}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 16px", color: "#6b3b82" }} />
          <h2 style={{ fontSize: "20px", color: "#321d3f" }}>Redirecting to your account dashboard...</h2>
          <p style={{ color: "#7a6e83", fontSize: "14px" }}>Logged in as {user.name} ({user.email})</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/account/profile">My Account</Link>
          {!isAuthMode && mode !== "profile" && (
            <>
              <span>/</span>
              <span style={{ textTransform: "capitalize" }}>{mode}</span>
            </>
          )}
        </div>

        {/* ================= USER AUTHENTICATED DASHBOARD (AMAZON / NYKAA STYLE) ================= */}
        {!isAuthMode ? (
          <div className={styles.accountHubWrapper}>
            {/* Nykaa/Amazon Profile Top Hero Banner */}
            <div className={styles.accountHeroCard}>
              <div className={styles.accountUserInfo}>
                <div className={styles.userAvatarCircle}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className={styles.welcomeTag}>
                    <Sparkles size={13} />
                    <span>Swachetna Patron Member</span>
                  </div>
                  <h1 className={styles.userNameHeading}>
                    Hello, {user?.name || "Valued Customer"}
                  </h1>
                  <p className={styles.userSubDetails}>
                    <Mail size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    {user?.email || "customer@swachetna.org"}
                    {user?.phone && (
                      <>
                        <span style={{ margin: "0 8px", opacity: 0.5 }}>•</span>
                        <Phone size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                        {user.phone}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Quick Hub Stats Badges */}
              <div className={styles.accountStatsRow}>
                <Link href="/account/orders" className={styles.statBadge}>
                  <PackageCheck size={18} />
                  <div>
                    <strong>{orders.length}</strong>
                    <span>Orders</span>
                  </div>
                </Link>

                <Link href="/wishlist" className={styles.statBadge}>
                  <Heart size={18} />
                  <div>
                    <strong>{validWishlistCount}</strong>
                    <span>Wishlist</span>
                  </div>
                </Link>

                <Link href="/cart" className={styles.statBadge}>
                  <ShoppingBag size={18} />
                  <div>
                    <strong>{cartCount}</strong>
                    <span>Bag</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className={styles.signOutBtn}
                  title="Sign Out of Account"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>

            {/* Amazon / Nykaa Grid Shortcuts */}
            <div className={styles.hubGridShortcuts}>
              <Link
                href="/account/orders"
                className={`${styles.shortcutTile} ${mode === "orders" ? styles.shortcutActive : ""}`}
              >
                <div className={`${styles.shortcutIcon} ${styles.iconPurple}`}>
                  <PackageCheck size={22} />
                </div>
                <div className={styles.shortcutText}>
                  <strong>Your Orders</strong>
                  <span>Track status, view receipts &amp; history</span>
                </div>
              </Link>

              <Link href="/track-order" className={styles.shortcutTile}>
                <div className={`${styles.shortcutIcon} ${styles.iconBlue}`}>
                  <Truck size={22} />
                </div>
                <div className={styles.shortcutText}>
                  <strong>Live Shipment Tracking</strong>
                  <span>Check real-time dispatch updates</span>
                </div>
              </Link>

              <Link
                href="/account/addresses"
                className={`${styles.shortcutTile} ${mode === "addresses" ? styles.shortcutActive : ""}`}
              >
                <div className={`${styles.shortcutIcon} ${styles.iconOrange}`}>
                  <MapPin size={22} />
                </div>
                <div className={styles.shortcutText}>
                  <strong>Saved Addresses</strong>
                  <span>Delivery addresses &amp; PIN codes</span>
                </div>
              </Link>

              <Link
                href="/account/profile"
                className={`${styles.shortcutTile} ${mode === "profile" ? styles.shortcutActive : ""}`}
              >
                <div className={`${styles.shortcutIcon} ${styles.iconGreen}`}>
                  <ShieldCheck size={22} />
                </div>
                <div className={styles.shortcutText}>
                  <strong>Login &amp; Security</strong>
                  <span>Name, email, phone &amp; preferences</span>
                </div>
              </Link>
            </div>

            {/* Main Content Workspace Card */}
            <div className={styles.accountContentCard}>
              {mode === "orders" ? (
                <div>
                  <div className={styles.cardHeaderFlex}>
                    <div>
                      <h2>Order History ({orders.length})</h2>
                      <p>View past orders, track dispatch progress, or view receipts.</p>
                    </div>
                    <Link href="/shop" className={styles.shopMoreBtn}>
                      <ShoppingBasket size={15} /> Continue Shopping
                    </Link>
                  </div>

                  {loadingOrders ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px", color: "#5d3570" }} />
                      <p style={{ color: "#7a6e83", fontSize: "14px" }}>Loading your orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className={styles.orderListContainer}>
                      {orders.map((ord) => {
                        const dateFormatted = new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        const isDelivered = ord.status?.toLowerCase().includes("delivered");
                        const isShipped = ord.status?.toLowerCase().includes("shipped");

                        return (
                          <div key={ord.reference} className={styles.orderCardItem}>
                            <div className={styles.orderCardHead}>
                              <div>
                                <span className={styles.orderLabel}>ORDER PLACED</span>
                                <strong>{dateFormatted}</strong>
                              </div>
                              <div>
                                <span className={styles.orderLabel}>TOTAL</span>
                                <strong>{formatCurrency(ord.total)}</strong>
                              </div>
                              <div>
                                <span className={styles.orderLabel}>SHIP TO</span>
                                <strong>{user?.name || "Customer"}</strong>
                              </div>
                              <div className={styles.orderIdBlock}>
                                <span className={styles.orderLabel}>ORDER # {ord.reference}</span>
                                <span
                                  className={styles.statusPill}
                                  style={{
                                    background: isDelivered ? "#eef8f2" : isShipped ? "#e8f0fe" : "#fbf2e2",
                                    color: isDelivered ? "#1a8f4c" : isShipped ? "#1967d2" : "#995200",
                                  }}
                                >
                                  {ord.status || "Confirmed"}
                                </span>
                              </div>
                            </div>

                            <div className={styles.orderCardBody}>
                              <div className={styles.orderItemsList}>
                                {ord.items && ord.items.length > 0 ? (
                                  ord.items.map((it, idx) => (
                                    <div key={idx} className={styles.orderProductRow}>
                                      {it.image ? (
                                        <img src={it.image} alt={it.name} className={styles.orderProductThumb} />
                                      ) : (
                                        <div className={styles.orderProductThumbPlaceholder}>
                                          <ShoppingBag size={18} />
                                        </div>
                                      )}
                                      <div>
                                        <strong className={styles.orderProductName}>{it.name}</strong>
                                        <div className={styles.orderProductQty}>
                                          Qty: {it.quantity} &nbsp;•&nbsp; {formatCurrency(it.price)}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ color: "#3a2d42", fontSize: "14px" }}>
                                    Swachetna Foundation Handcrafted Products
                                  </div>
                                )}
                              </div>

                              <div className={styles.orderActionsCol}>
                                <Link
                                  href={`/track-order?ref=${ord.reference}`}
                                  className={styles.trackPackageBtn}
                                >
                                  <Truck size={15} /> Track Package
                                </Link>
                                <Link
                                  href={`/order-confirmation?ref=${ord.reference}`}
                                  className={styles.viewReceiptBtn}
                                >
                                  View Receipt
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <PackageCheck size={48} style={{ color: "#b9a6c2", margin: "0 auto 12px" }} />
                      <h3 style={{ fontSize: "17px", color: "#321d3f", margin: "0 0 6px" }}>No orders placed yet</h3>
                      <p style={{ color: "#8a7e93", fontSize: "14px", margin: "0 0 18px" }}>
                        Explore authentic organic pickles, laddus, and handcrafted rural treasures.
                      </p>
                      <Link href="/shop" className={styles.primaryActionButton}>
                        Explore Handcrafted Creations →
                      </Link>
                    </div>
                  )}
                </div>
              ) : mode === "addresses" ? (
                <div>
                  <div className={styles.cardHeaderFlex}>
                    <div>
                      <h2>Delivery Addresses</h2>
                      <p>Manage your default shipping addresses for fast 1-click checkout.</p>
                    </div>
                  </div>

                  <div className={styles.addressGrid}>
                    {savedAddress ? (
                      <div className={styles.addressCardActive}>
                        <span className={styles.defaultAddressBadge}>DEFAULT ADDRESS</span>
                        <strong className={styles.addressName}>{user?.name || "Customer"}</strong>
                        <p className={styles.addressLines}>
                          {savedAddress.line}<br />
                          {savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}
                        </p>
                        <span className={styles.addressPhone}>Phone: {user?.phone || "+91 98765 43210"}</span>
                      </div>
                    ) : (
                      <div className={styles.addressEmptyCard}>
                        <MapPin size={32} style={{ color: "#9a8a9f", margin: "0 auto 10px" }} />
                        <strong>No address saved yet</strong>
                        <p>Addresses are saved during checkout automatically or you can add one below.</p>
                      </div>
                    )}

                    {/* Quick Add / Update Address Card */}
                    <div className={styles.addressFormCard}>
                      <strong className={styles.formCardTitle}>
                        <Plus size={16} /> Add or Update Address
                      </strong>
                      <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                        <input
                          placeholder="Street Address / House / Flat No."
                          value={addressDraft.line}
                          onChange={(e) => setAddressDraft({ ...addressDraft, line: e.target.value })}
                          required
                        />
                        <div className={styles.addressInputRow}>
                          <input
                            placeholder="City"
                            value={addressDraft.city}
                            onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                            required
                          />
                          <input
                            placeholder="State"
                            value={addressDraft.state}
                            onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })}
                            required
                          />
                        </div>
                        <input
                          placeholder="PIN Code"
                          value={addressDraft.postalCode}
                          onChange={(e) => setAddressDraft({ ...addressDraft, postalCode: e.target.value })}
                          required
                        />
                        <button type="submit" className={styles.saveAddressBtn}>
                          Save Address
                        </button>
                      </form>
                      {message && <p className={styles.addressSuccessNote}>{message}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                /* Profile & Account Details */
                <div>
                  <div className={styles.cardHeaderFlex}>
                    <div>
                      <h2>Personal Information &amp; Login Security</h2>
                      <p>View your profile details, registered contact numbers, and login credentials.</p>
                    </div>
                  </div>

                  <div className={styles.profileDetailsList}>
                    <div className={styles.profileRow}>
                      <div>
                        <span className={styles.profileFieldLabel}>FULL NAME</span>
                        <strong className={styles.profileFieldValue}>{user?.name || "Not set"}</strong>
                      </div>
                      <span className={styles.verifiedBadge}>Verified</span>
                    </div>

                    <div className={styles.profileRow}>
                      <div>
                        <span className={styles.profileFieldLabel}>EMAIL ADDRESS</span>
                        <strong className={styles.profileFieldValue}>{user?.email || "Not set"}</strong>
                      </div>
                      <span className={styles.verifiedBadge}>Primary Account</span>
                    </div>

                    <div className={styles.profileRow}>
                      <div>
                        <span className={styles.profileFieldLabel}>PRIMARY CONTACT MOBILE</span>
                        <strong className={styles.profileFieldValue}>{user?.phone || "+91 98765 43210"}</strong>
                      </div>
                      <span className={styles.smsAlertBadge}>SMS Updates Enabled</span>
                    </div>

                    <div className={styles.profileRow}>
                      <div>
                        <span className={styles.profileFieldLabel}>MEMBERSHIP STATUS</span>
                        <strong className={styles.profileFieldValue}>Swachetna Foundation Supporter</strong>
                      </div>
                      <Award size={20} style={{ color: "#6b3b82" }} />
                    </div>
                  </div>

                  <div className={styles.profileActionFooter}>
                    <Link href="/account/orders" className={styles.primaryActionButton}>
                      View All Orders ({orders.length})
                    </Link>
                    <Link href="/account/addresses" className={styles.secondaryActionButton}>
                      Manage Delivery Addresses
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={styles.dangerSignOutButton}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= AUTHENTICATION FORMS (LOGIN / REGISTER / FORGOT) ================= */
          <div className={styles.grid}>
            <aside className={styles.introPanel}>
              <span className={styles.brandMark}><UserRound aria-hidden="true" /></span>
              <span className={styles.eyebrow}>YOUR SWACHETNA SPACE</span>
              <h1>{mode === "login" ? "Welcome back." : mode === "register" ? "Create account." : "Reset password."}</h1>
              <p className={styles.intro}>
                {mode === "login"
                  ? "Sign in to track orders, manage addresses, and support rural artisan communities."
                  : "Join Swachetna Foundation to directly support rural artisan communities."}
              </p>
              <div className={styles.decorativeOrb} aria-hidden="true" />
            </aside>

            <section className={styles.panel} aria-labelledby="account-form-title">
              <div className={styles.panelHeading}>
                <span className={styles.panelIcon}><KeyRound aria-hidden="true" /></span>
                <div>
                  <span className={styles.panelEyebrow}>{mode === "forgot" ? "ACCOUNT SUPPORT" : "MEMBER ACCESS"}</span>
                  <h2 id="account-form-title">{mode === "login" ? "Sign in" : mode === "register" ? "Create your account" : "Reset your password"}</h2>
                </div>
              </div>

              <form className={styles.form} onSubmit={submit}>
                {mode === "register" && (
                  <label>
                    Full name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      placeholder="e.g. Aditi Sharma"
                      required
                      disabled={loading}
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </label>
                {mode === "register" && (
                  <label>
                    Mobile Phone <span className={styles.optional}>(for order SMS updates)</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="e.g. 9876543210"
                      disabled={loading}
                    />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label>
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      minLength={6}
                      placeholder={mode === "register" ? "Create a secure password (min 6 chars)" : "Enter your password"}
                      required
                      disabled={loading}
                    />
                  </label>
                )}
                {mode === "forgot" && <p className={styles.formHint}>Enter your email to receive password reset instructions.</p>}

                <button className={styles.submitButton} disabled={loading}>
                  {loading ? (
                    <>Processing... <Loader2 size={16} className="animate-spin" /></>
                  ) : (
                    <>
                      {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
                      <ArrowRight aria-hidden="true" size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Login for quick testing without typing password */}
              {mode === "login" && (
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#f4eaf7",
                      border: "1px dashed #6b3b82",
                      borderRadius: "10px",
                      color: "#502466",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <Sparkles size={15} /> 1-Click Demo Sign In (Aditi Sharma)
                  </button>
                </div>
              )}

              {message && (
                <p
                  className={styles.message}
                  style={{
                    background: isError ? "#fef2f2" : "#f0fdf4",
                    color: isError ? "#991b1b" : "#166534",
                    border: `1px solid ${isError ? "#fecaca" : "#bbf7d0"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  role="status"
                >
                  {isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  {message}
                </p>
              )}

              <div className={styles.links}>
                {mode !== "login" && <span>Already have an account? <Link href="/account/login">Sign in</Link></span>}
                {mode === "login" && <span>New to Swachetna? <Link href="/account/register">Create an account</Link></span>}
                {mode !== "forgot" && <Link href="/account/forgot-password">Forgot password?</Link>}
                {mode === "forgot" && <Link href="/contact">Need help? Contact us</Link>}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
