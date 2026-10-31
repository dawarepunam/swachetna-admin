"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, PackageCheck, Printer, ArrowRight, ShieldCheck, Truck, Mail, Phone } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../data/products";
import styles from "./confirmation.module.css";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  reference: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items?: OrderItem[];
  createdAt: string;
  paymentMethod?: string;
  status?: string;
};

export default function ConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const { clearCart } = useStore();

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("ref");
    try {
      const latest = window.localStorage.getItem("swachetna-last-demo-order");
      if (!latest) return;
      const parsed = JSON.parse(latest) as Order;
      if (parsed.reference === reference || !reference) {
        setOrder(parsed);
        clearCart();
      }
    } catch { /* Ignore malformed order data */ }
  }, [clearCart]);

  return (
    <main className={styles.page}>
      <div className="container">
        <section className={styles.card}>
          <div className={styles.successBadge}>
            <CheckCircle2 size={42} className={styles.successIcon} />
          </div>

          <span className={styles.eyebrow}>ORDER CONFIRMED</span>
          <h1>Thank you for<br /><em>your order!</em></h1>
          <p className={styles.subtitle}>
            Your payment was successfully received and your order is now confirmed. We are preparing your handcrafted treasures with care.
          </p>

          {order ? (
            <div className={styles.orderReceipt}>
              <div className={styles.receiptHeader}>
                <div>
                  <span className={styles.metaLabel}>ORDER NUMBER</span>
                  <strong className={styles.orderRef}>{order.reference}</strong>
                </div>
                <div>
                  <span className={styles.metaLabel}>ORDER DATE</span>
                  <strong className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div>
                  <span className={styles.metaLabel}>PAYMENT METHOD</span>
                  <strong className={styles.paymentMethodBadge}>
                    {order.paymentMethod || "Razorpay Online"}
                  </strong>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className={styles.itemsSection}>
                  <h3>Order Summary</h3>
                  <div className={styles.itemsList}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemQty}>{item.quantity}x</span>
                          <span className={styles.itemName}>{item.name}</span>
                        </div>
                        <strong className={styles.itemPrice}>
                          {formatCurrency(item.price * item.quantity)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.deliveryDetails}>
                <div className={styles.addressBox}>
                  <h4><Truck size={16} /> Delivery Address</h4>
                  <p><strong>{order.customer?.name}</strong></p>
                  <p>{order.customer?.address}</p>
                  <p>{order.customer?.city}, {order.customer?.state} - {order.customer?.postalCode}</p>
                  <div className={styles.contactDetails}>
                    {order.customer?.email && <span><Mail size={13} /> {order.customer.email}</span>}
                    {order.customer?.phone && <span><Phone size={13} /> {order.customer.phone}</span>}
                  </div>
                </div>

                <div className={styles.summaryTotalBox}>
                  <div className={styles.totalRow}>
                    <span>Total Amount Paid</span>
                    <strong className={styles.grandTotal}>{formatCurrency(order.total)}</strong>
                  </div>
                  <span className={styles.paidStatus}><ShieldCheck size={14} /> Payment Verified</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.reference}>
              <span>ORDER REFERENCE</span>
              <strong>Order received successfully</strong>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.printBtn}
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print / Save Tax Invoice (PDF)
            </button>
            <Link href="/shop" className={styles.shopBtn}>
              Continue Shopping <ArrowRight size={16} />
            </Link>
            <Link href="/track-order" className={styles.trackBtn}>
              <PackageCheck size={16} /> Track Order Status
            </Link>
          </div>

          <div className={styles.guaranteeNote}>
            <ShieldCheck size={15} /> 100% Authentic Handcrafted Products · Empowering Rural Communities
          </div>
        </section>
      </div>
    </main>
  );
}

