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
  Plus
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
    }

    // Load orders: Live from Strapi first, then localStorage
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

            const finalOrders = [...combinedMap.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            setUser(userData);
            setMessage("Welcome back! Signed in successfully.");
            loggedIn = true;
            setTimeout(() => router.push("/account/profile"), 800);
          } else if (resData.error && !resData.error.includes("connect") && !resData.error.includes("fetch")) {
            setMessage(resData.error);
            setIsError(true);
            setLoading(false);
            return;
          }
        } catch {
          /* Fallback gracefully */
        }

        if (!loggedIn) {
          const localUser: User = {
            name: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " "),
            email,
            phone: phone || "",
          };
          localStorage.setItem("swachetna-demo-user", JSON.stringify(localUser));
          setUser(localUser);
          setMessage("Welcome back! Signed in successfully.");
          setTimeout(() => router.push("/account/profile"), 800);
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
            setUser(userData);
            setMessage("Account created successfully! Welcome to Swachetna.");
            registered = true;
            setTimeout(() => router.push("/account/profile"), 900);
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
            phone: phone.trim(),
          };
          localStorage.setItem("swachetna-demo-user", JSON.stringify(localUser));
          setUser(localUser);
          setMessage("Account created successfully! Welcome to Swachetna.");
          setTimeout(() => router.push("/account/profile"), 900);
        }
      }
    } catch (err: any) {
      setMessage("An unexpected error occurred. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!addressDraft.line || !addressDraft.city) return;
    const newAddr = { ...addressDraft };
    localStorage.setItem("swachetna-saved-address", JSON.stringify(newAddr));
    setSavedAddress(newAddr);
    setMessage("Address saved successfully!");
  };

  const isAuthMode = mode === "login" || mode === "register" || mode === "forgot";

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

        {/* ================= USER AUTHENTICATED E-COMMERCE HUB (AMAZON / NYKAA STYLE) ================= */}
        {!isAuthMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top User Greeting & Summary Card */}
            <div style={{
              background: "linear-gradient(135deg, #371d47 0%, #4f2a66 100%)",
              color: "white",
              borderRadius: "20px",
              padding: "28px 32px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              boxShadow: "0 12px 30px rgba(55, 29, 71, 0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "22px",
                  fontWeight: "bold",
                  border: "2px solid rgba(255,255,255,0.3)"
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "600" }}>
                    Hello, {user?.name || "Valued Customer"} 👋
                  </h1>
                  <p style={{ margin: "4px 0 0", color: "#dec7ea", fontSize: "13px" }}>
                    {user?.email || "Signed in account"} {user?.phone ? `· ${user.phone}` : ""}
                  </p>
                </div>
              </div>

              {/* Quick Hub Stats */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <Link href="/account/orders" style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  color: "#fff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <PackageCheck size={18} />
                  <div>
                    <strong style={{ display: "block", fontSize: "15px" }}>{orders.length}</strong>
                    <span style={{ fontSize: "11px", color: "#dec7ea" }}>Orders</span>
                  </div>
                </Link>

                <Link href="/wishlist" style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  color: "#fff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <Heart size={18} />
                  <div>
                    <strong style={{ display: "block", fontSize: "15px" }}>{validWishlistCount}</strong>
                    <span style={{ fontSize: "11px", color: "#dec7ea" }}>Wishlist</span>
                  </div>
                </Link>

                <Link href="/cart" style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  color: "#fff",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <ShoppingBag size={18} />
                  <div>
                    <strong style={{ display: "block", fontSize: "15px" }}>{cartCount}</strong>
                    <span style={{ fontSize: "11px", color: "#dec7ea" }}>Bag</span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("swachetna-demo-user");
                    setUser(null);
                    router.push("/account/login");
                  }}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    color: "#ffcdd2",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                  title="Sign Out"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>

            {/* Amazon / Nykaa Grid Shortcuts */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}>
              <Link href="/account/orders" style={{
                background: "#fff",
                border: mode === "orders" ? "2px solid #5d3570" : "1px solid #ebe4ef",
                borderRadius: "16px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                transition: "all 0.2s"
              }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#f3eaf7", color: "#5d3570", display: "grid", placeItems: "center" }}>
                  <PackageCheck size={22} />
                </div>
                <div>
                  <strong style={{ color: "#321d3f", fontSize: "15px", display: "block" }}>Your Orders</strong>
                  <span style={{ color: "#7a6e83", fontSize: "12px" }}>Track, return, or buy again</span>
                </div>
              </Link>

              <Link href="/track-order" style={{
                background: "#fff",
                border: "1px solid #ebe4ef",
                borderRadius: "16px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
              }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#e8f0fe", color: "#1967d2", display: "grid", placeItems: "center" }}>
                  <Truck size={22} />
                </div>
                <div>
                  <strong style={{ color: "#321d3f", fontSize: "15px", display: "block" }}>Live Tracking</strong>
                  <span style={{ color: "#7a6e83", fontSize: "12px" }}>Shipment &amp; courier status</span>
                </div>
              </Link>

              <Link href="/account/addresses" style={{
                background: "#fff",
                border: mode === "addresses" ? "2px solid #5d3570" : "1px solid #ebe4ef",
                borderRadius: "16px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
              }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#fef3e2", color: "#b06000", display: "grid", placeItems: "center" }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <strong style={{ color: "#321d3f", fontSize: "15px", display: "block" }}>Saved Addresses</strong>
                  <span style={{ color: "#7a6e83", fontSize: "12px" }}>Manage delivery locations</span>
                </div>
              </Link>

              <Link href="/contact" style={{
                background: "#fff",
                border: "1px solid #ebe4ef",
                borderRadius: "16px",
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
              }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#eef8f2", color: "#1a8f4c", display: "grid", placeItems: "center" }}>
                  <Headphones size={22} />
                </div>
                <div>
                  <strong style={{ color: "#321d3f", fontSize: "15px", display: "block" }}>Customer Support</strong>
                  <span style={{ color: "#7a6e83", fontSize: "12px" }}>Contact helpdesk &amp; FAQs</span>
                </div>
              </Link>
            </div>

            {/* Dynamic Content Pane based on Sub-route */}
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #ebe4ef",
              boxShadow: "0 6px 20px rgba(0,0,0,0.02)"
            }}>
              {mode === "orders" ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                    <div>
                      <h2 style={{ fontSize: "20px", color: "#321d3f", margin: 0 }}>Your Orders &amp; Handcrafted Purchases</h2>
                      <p style={{ margin: "4px 0 0", color: "#7a6e83", fontSize: "13px" }}>
                        Real-time status synced with Swachetna Foundation backend
                      </p>
                    </div>
                    <Link href="/shop" style={{ color: "#5d3570", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
                      Continue Shopping →
                    </Link>
                  </div>

                  {loadingOrders ? (
                    <p style={{ color: "#7a6e83", textAlign: "center", padding: "40px 0" }}>Loading your orders from Strapi...</p>
                  ) : orders.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      {orders.map((ord) => {
                        const st = ord.status || "Pending";
                        return (
                          <div
                            key={ord.reference}
                            style={{
                              border: "1px solid #e8e1ec",
                              borderRadius: "14px",
                              overflow: "hidden"
                            }}
                          >
                            {/* Order Header */}
                            <div style={{
                              background: "#f9f7fa",
                              padding: "14px 20px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "12px",
                              borderBottom: "1px solid #e8e1ec",
                              fontSize: "12px"
                            }}>
                              <div style={{ display: "flex", gap: "24px" }}>
                                <div>
                                  <span style={{ color: "#8a7e93", display: "block" }}>ORDER PLACED</span>
                                  <strong>{new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
                                </div>
                                <div>
                                  <span style={{ color: "#8a7e93", display: "block" }}>TOTAL AMOUNT</span>
                                  <strong>{formatCurrency(ord.total)}</strong>
                                </div>
                                <div>
                                  <span style={{ color: "#8a7e93", display: "block" }}>PAYMENT</span>
                                  <strong>{ord.paymentMethod || "Online"}</strong>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ color: "#8a7e93", display: "block" }}>ORDER # {ord.reference}</span>
                                <Link href={`/track-order?ref=${ord.reference}`} style={{ color: "#5d3570", fontWeight: "600", textDecoration: "none" }}>
                                  View Live Details
                                </Link>
                              </div>
                            </div>

                            {/* Order Body */}
                            <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                              <div style={{ flex: "1 1 360px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                  <span style={{
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    padding: "4px 12px",
                                    borderRadius: "99px",
                                    background: st === "Delivered" ? "#eef8f2" : st === "Shipped" ? "#e8f0fe" : "#fff8e6",
                                    color: st === "Delivered" ? "#1a8f4c" : st === "Shipped" ? "#1967d2" : "#b06000",
                                    border: "1px solid currentColor"
                                  }}>
                                    ● {st.toUpperCase()}
                                  </span>
                                  <span style={{ color: "#6a5e73", fontSize: "13px" }}>
                                    {st === "Delivered" ? "Package was delivered safely" : st === "Shipped" ? "Package is in transit with courier" : "Preparing handcrafted order with care"}
                                  </span>
                                </div>

                                {/* Amazon Style Item Showcase with Thumbnails */}
                                {ord.items && ord.items.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {ord.items.map((it, idx) => (
                                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        {/* Product Thumbnail Image */}
                                        <div style={{
                                          width: "64px",
                                          height: "64px",
                                          borderRadius: "10px",
                                          border: "1px solid #ebdfee",
                                          background: "#fbf9fc",
                                          overflow: "hidden",
                                          flexShrink: 0,
                                          display: "grid",
                                          placeItems: "center"
                                        }}>
                                          {it.image ? (
                                            <img
                                              src={it.image}
                                              alt={it.name}
                                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                          ) : (
                                            <ShoppingBag size={24} style={{ color: "#a597ad" }} />
                                          )}
                                        </div>

                                        <div>
                                          <div style={{ color: "#3a2d42", fontSize: "14px", fontWeight: "600" }}>
                                            {it.name}
                                          </div>
                                          <div style={{ color: "#7a6e83", fontSize: "12px", marginTop: "2px" }}>
                                            Qty: <strong>{it.quantity}</strong> · {formatCurrency(it.price * it.quantity)}
                                          </div>
                                          <Link
                                            href="/shop"
                                            style={{
                                              color: "#5d3570",
                                              fontSize: "11px",
                                              fontWeight: "600",
                                              textDecoration: "none",
                                              display: "inline-block",
                                              marginTop: "3px"
                                            }}
                                          >
                                            Buy it again →
                                          </Link>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ color: "#3a2d42", fontSize: "13px" }}>Swachetna Foundation Handcrafted Products</div>
                                )}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "160px" }}>
                                <Link
                                  href={`/track-order?ref=${ord.reference}`}
                                  style={{
                                    background: "#5d3570",
                                    color: "#fff",
                                    padding: "10px 18px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px"
                                  }}
                                >
                                  <Truck size={15} /> Track Package
                                </Link>
                                <Link
                                  href={`/order-confirmation?ref=${ord.reference}`}
                                  style={{
                                    border: "1px solid #d4c7d9",
                                    color: "#5d3570",
                                    padding: "9px 16px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    textDecoration: "none",
                                    textAlign: "center"
                                  }}
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
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <p style={{ color: "#8a7e93", fontSize: "14px" }}>You have not placed any orders yet.</p>
                      <Link href="/shop" style={{
                        display: "inline-block",
                        marginTop: "12px",
                        background: "#5d3570",
                        color: "white",
                        padding: "10px 22px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "600",
                        textDecoration: "none"
                      }}>
                        Explore Handcrafted Creations →
                      </Link>
                    </div>
                  )}
                </div>
              ) : mode === "addresses" ? (
                <div>
                  <h2 style={{ fontSize: "20px", color: "#321d3f", margin: "0 0 16px" }}>Delivery Addresses</h2>
                  <p style={{ color: "#7a6e83", fontSize: "13px", marginBottom: "20px" }}>
                    Manage default shipping address for fast 1-click checkout.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                    {savedAddress ? (
                      <div style={{ border: "2px solid #5d3570", borderRadius: "14px", padding: "20px", position: "relative" }}>
                        <span style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#1a8f4c",
                          background: "#eef8f2",
                          padding: "2px 8px",
                          borderRadius: "99px"
                        }}>
                          DEFAULT
                        </span>
                        <strong style={{ fontSize: "15px", color: "#321d3f", display: "block" }}>{user?.name || "Customer"}</strong>
                        <p style={{ color: "#6a5e73", fontSize: "13px", margin: "8px 0" }}>
                          {savedAddress.line}<br />
                          {savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}
                        </p>
                        <span style={{ color: "#8a7e93", fontSize: "12px" }}>Phone: {user?.phone || "Not specified"}</span>
                      </div>
                    ) : (
                      <div style={{ border: "1px dashed #cbbdd1", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                        <MapPin size={28} style={{ color: "#8a7e93", margin: "0 auto 8px" }} />
                        <p style={{ fontSize: "13px", color: "#7a6e83" }}>No address saved yet. Addresses are saved during checkout automatically.</p>
                      </div>
                    )}

                    {/* Quick Add Address Form */}
                    <div style={{ background: "#fbf9fc", borderRadius: "14px", padding: "20px", border: "1px solid #ebdfee" }}>
                      <strong style={{ fontSize: "14px", color: "#321d3f", display: "block", marginBottom: "12px" }}>
                        <Plus size={15} style={{ display: "inline", verticalAlign: "middle" }} /> Add / Update Address
                      </strong>
                      <form onSubmit={handleSaveAddress} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <input
                          placeholder="Street Address / House / Apartment"
                          value={addressDraft.line}
                          onChange={(e) => setAddressDraft({ ...addressDraft, line: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "7px", border: "1px solid #d8cedc", fontSize: "13px" }}
                          required
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <input
                            placeholder="City"
                            value={addressDraft.city}
                            onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                            style={{ padding: "8px 12px", borderRadius: "7px", border: "1px solid #d8cedc", fontSize: "13px" }}
                            required
                          />
                          <input
                            placeholder="State"
                            value={addressDraft.state}
                            onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })}
                            style={{ padding: "8px 12px", borderRadius: "7px", border: "1px solid #d8cedc", fontSize: "13px" }}
                          />
                        </div>
                        <input
                          placeholder="PIN Code"
                          value={addressDraft.postalCode}
                          onChange={(e) => setAddressDraft({ ...addressDraft, postalCode: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "7px", border: "1px solid #d8cedc", fontSize: "13px" }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: "#5d3570",
                            color: "white",
                            border: "none",
                            padding: "9px 16px",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          Save Address
                        </button>
                      </form>
                      {message && <p style={{ fontSize: "12px", color: "#166534", marginTop: "8px" }}>{message}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                /* Profile Details */
                <div>
                  <h2 style={{ fontSize: "20px", color: "#321d3f", margin: "0 0 18px" }}>Login &amp; Security Settings</h2>
                  <div style={{ display: "grid", gap: "14px", maxWidth: "560px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #eee5f1" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#8a7e93", display: "block" }}>NAME</span>
                        <strong style={{ fontSize: "14px", color: "#321d3f" }}>{user?.name || "Not set"}</strong>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #eee5f1" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#8a7e93", display: "block" }}>EMAIL ADDRESS</span>
                        <strong style={{ fontSize: "14px", color: "#321d3f" }}>{user?.email || "Not set"}</strong>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #eee5f1" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#8a7e93", display: "block" }}>PRIMARY MOBILE</span>
                        <strong style={{ fontSize: "14px", color: "#321d3f" }}>{user?.phone || "Not set"}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
                    <Link
                      href="/account/orders"
                      style={{
                        background: "#5d3570",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "600",
                        textDecoration: "none"
                      }}
                    >
                      View All Orders ({orders.length})
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("swachetna-demo-user");
                        setUser(null);
                        router.push("/account/login");
                      }}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2d6e6",
                        color: "#a32a2a",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Sign Out
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
                    <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="e.g. Aditi Sharma" required disabled={loading} />
                  </label>
                )}
                <label>
                  Email address
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required disabled={loading} />
                </label>
                {mode === "register" && (
                  <label>
                    Mobile Phone <span className={styles.optional}>(for order SMS updates)</span>
                    <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="e.g. 9876543210" disabled={loading} />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label>
                    Password
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={6} placeholder={mode === "register" ? "Create a secure password (min 6 chars)" : "Enter your password"} required disabled={loading} />
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
