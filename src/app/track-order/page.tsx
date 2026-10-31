"use client";

import { useState, useEffect, type FormEvent } from "react";
import { PackageSearch, CheckCircle2, Clock, Truck, ShieldCheck, ArrowRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import styles from "./track-order.module.css";
import { formatCurrency } from "../../data/products";

type TrackedOrder = {
  reference: string;
  customer: { name: string; email?: string; phone?: string; address?: string };
  total: number;
  createdAt: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  paymentMethod?: string;
  items?: Array<{ name: string; quantity: number; price: number; image?: string }>;
};

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const performLookup = async (lookupQuery: string) => {
    const query = lookupQuery.trim().toLowerCase();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setOrder(null);

    let foundOrder: TrackedOrder | null = null;

    // 1. First try live Strapi orders via admin workspace API
    try {
      const res = await fetch("/api/admin/workspace", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const orders = json?.data?.orders;
        if (Array.isArray(orders)) {
          const match = orders.find((o: any) =>
            (o.orderId && o.orderId.toLowerCase() === query) ||
            (o.id && String(o.id).toLowerCase() === query) ||
            (o.customerPhone && o.customerPhone.toLowerCase() === query)
          );
          if (match) {
            foundOrder = {
              reference: match.orderId || String(match.id),
              customer: {
                name: match.customer || "Valued Customer",
                email: match.customerEmail,
                phone: match.customerPhone,
                address: match.customerAddress,
              },
              total: Number(match.total) || 0,
              createdAt: match.orderDate || new Date().toISOString(),
              status: match.status || "Pending",
              paymentMethod: match.paymentMethod,
              items: Array.isArray(match.items) ? match.items : [],
            };
          }
        }
      }
    } catch (err) {
      console.warn("Strapi order lookup error:", err);
    }

    // 2. Fallback to localStorage demo orders if not found in Strapi
    if (!foundOrder) {
      try {
        const localOrders = JSON.parse(localStorage.getItem("swachetna-demo-orders") || "[]");
        if (Array.isArray(localOrders)) {
          const match = localOrders.find((item: any) =>
            item.reference && item.reference.toLowerCase() === query
          );
          if (match) {
            foundOrder = {
              reference: match.reference,
              customer: {
                name: match.customer?.name || "Valued Customer",
                email: match.customer?.email,
                phone: match.customer?.phone,
                address: [match.customer?.address, match.customer?.city, match.customer?.state].filter(Boolean).join(", "),
              },
              total: Number(match.total) || 0,
              createdAt: match.createdAt || new Date().toISOString(),
              status: match.status || "Pending",
              paymentMethod: match.paymentMethod,
              items: match.items || [],
            };
          }
        }
      } catch {
        /* ignore */
      }
    }

    setOrder(foundOrder);
    setLoading(false);
  };

  // Auto-fill and lookup if URL contains ?ref=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlRef = new URLSearchParams(window.location.search).get("ref");
    if (urlRef) {
      setReference(urlRef);
      performLookup(urlRef);
    }
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    performLookup(reference);
  };

  // Determine timeline progress based on Strapi status
  const currentStatus = order?.status || "Pending";
  const isPendingDone = true; // Always placed
  const isProcessingDone = currentStatus === "Processing" || currentStatus === "Shipped" || currentStatus === "Delivered";
  const isShippedDone = currentStatus === "Shipped" || currentStatus === "Delivered";
  const isDeliveredDone = currentStatus === "Delivered";

  return (
    <main className={styles.page}>
      <div className="container">
        <span className={styles.eyebrow}>ORDER TRACKING</span>
        <h1>Track your <em>shipment.</em></h1>
        <p>Enter your order confirmation number, payment ID, or registered phone number to check live status from Strapi.</p>

        <form onSubmit={submit}>
          <label htmlFor="ref">Order Reference / Payment ID / Phone</label>
          <input
            id="ref"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. SW-RZP-1234567, pay_..., or 9876543210"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <PackageSearch size={16} />}
            {loading ? "Checking..." : "Track Order"}
          </button>
        </form>

        {searched && !loading && (
          <section className={styles.result} role="status">
            {order ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #f0eaf4", paddingBottom: "14px" }}>
                  <div>
                    <strong style={{ fontSize: "14px", color: "#3a2e42" }}>Order #{order.reference}</strong>
                    <p style={{ margin: "4px 0 0", color: "#6a5e73", fontSize: "12px" }}>
                      Placed by <strong>{order.customer.name}</strong> · {formatCurrency(order.total)}
                    </p>
                    {order.customer.address && (
                      <p style={{ margin: "4px 0 0", color: "#8a7c93", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} /> {order.customer.address}
                      </p>
                    )}
                  </div>
                  <span style={{
                    background: currentStatus === "Delivered" ? "#eef8f2" : currentStatus === "Shipped" ? "#e8f0fe" : "#fff8e6",
                    color: currentStatus === "Delivered" ? "#1a8f4c" : currentStatus === "Shipped" ? "#1967d2" : "#b06000",
                    padding: "6px 14px",
                    borderRadius: "99px",
                    fontSize: "12px",
                    fontWeight: "600",
                    border: "1px solid currentColor"
                  }}>
                    {currentStatus.toUpperCase()}
                  </span>
                </div>

                <ol style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li className={isPendingDone ? styles.done : ""} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <CheckCircle2 size={18} style={{ color: isPendingDone ? "#1a8f4c" : "#ccc" }} />
                    <span><strong>Order Placed &amp; Confirmed</strong> — Payment method: {order.paymentMethod || "Online"}</span>
                  </li>
                  <li className={isProcessingDone ? styles.done : ""} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <Clock size={18} style={{ color: isProcessingDone ? "#1a8f4c" : "#ccc" }} />
                    <span><strong>Artisan Crafting &amp; Quality Check</strong> — Handcrafted with care</span>
                  </li>
                  <li className={isShippedDone ? styles.done : ""} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <Truck size={18} style={{ color: isShippedDone ? "#1a8f4c" : "#ccc" }} />
                    <span><strong>Dispatched / In Transit</strong> — Courier tracking active</span>
                  </li>
                  <li className={isDeliveredDone ? styles.done : ""} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <CheckCircle2 size={18} style={{ color: isDeliveredDone ? "#1a8f4c" : "#ccc" }} />
                    <span><strong>Delivered</strong> — Reached destination</span>
                  </li>
                </ol>

                {order.items && order.items.length > 0 && (
                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed #e8e1ec" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#8a7c93", letterSpacing: "0.05em" }}>ITEMS IN THIS ORDER</span>
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {it.image && (
                              <img
                                src={it.image}
                                alt={it.name}
                                style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", border: "1px solid #ebdfee" }}
                              />
                            )}
                            <div>
                              <div style={{ fontSize: "13px", color: "#3a2e42", fontWeight: "500" }}>{it.name}</div>
                              <span style={{ fontSize: "11px", color: "#8a7c93" }}>Qty: {it.quantity}</span>
                            </div>
                          </div>
                          <strong style={{ fontSize: "13px", color: "#3a2e42" }}>{formatCurrency(it.price * it.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <small style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", color: "#8a7c93", fontSize: "11px" }}>
                  <ShieldCheck size={14} />
                  Live status synced with Swachetna Foundation Admin &amp; Strapi.
                </small>
              </>
            ) : (
              <div>
                <strong>No order found with reference: {reference}</strong>
                <p style={{ margin: "8px 0 16px", color: "#7a6e83", fontSize: "13px" }}>
                  Please check the reference number from your receipt/email and try again.
                </p>
                <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#5c456c", fontSize: "13px", fontWeight: "600" }}>
                  Explore products in shop <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}