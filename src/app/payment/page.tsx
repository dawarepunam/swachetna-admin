"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, Smartphone, Truck } from "lucide-react";
import { formatCurrency, products as staticCatalog, getProductGst } from "../../data/products";
import { useStore } from "../../context/StoreContext";
import { CHECKOUT_DRAFT_KEY, PAYMENT_METHOD_LABELS, type CheckoutDraft, type DemoOrder, type PaymentMethod } from "../../types/checkout";
import styles from "./payment.module.css";

import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const methods: { id: PaymentMethod; title: string; detail: string; icon: typeof Smartphone }[] = [
  { id: "upi", title: "UPI", detail: "Google Pay, PhonePe, Paytm via Razorpay", icon: Smartphone },
  { id: "card", title: "Credit or debit card", detail: "Visa, Mastercard, RuPay via Razorpay", icon: CreditCard },
  { id: "cod", title: "Cash on delivery", detail: "Pay when your order arrives", icon: Truck },
];

function isCheckoutDraft(value: unknown): value is CheckoutDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<CheckoutDraft>;
  const customer = draft.customer;
  return Boolean(customer && typeof customer === "object"
    && ["name", "email", "phone", "address", "city", "state", "postalCode"].every((key) => typeof customer[key as keyof typeof customer] === "string")
    && typeof draft.createdAt === "string");
}

export default function PaymentPage() {
  const router = useRouter();
  const { cart, subtotal, ready, allProducts } = useStore();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
  const discountAmount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discount) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);
  const findMatchingProduct = (lookupId: string) => {
    if (!lookupId) return undefined;
    const lower = String(lookupId).toLowerCase().trim();
    const foundInLive = allProducts.find((p) =>
      String(p.id).toLowerCase().trim() === lower ||
      (p.slug && p.slug.toLowerCase().trim() === lower) ||
      (p.sku && p.sku.toLowerCase().trim() === lower)
    );
    if (foundInLive) return foundInLive;

    return staticCatalog.find((p) =>
      String(p.id).toLowerCase().trim() === lower ||
      (p.slug && p.slug.toLowerCase().trim() === lower) ||
      (p.sku && p.sku.toLowerCase().trim() === lower)
    );
  };
  const lines = useMemo(() => cart.map((line) => {
    const matched = findMatchingProduct(line.productId);
    const product = matched || ({
      id: line.productId,
      slug: (line as any).slug || line.productId,
      name: (line as any).name || "Handcrafted Product",
      price: typeof (line as any).price === "number" ? (line as any).price : 0,
      image: (line as any).image || "",
      sku: (line as any).sku || "",
      category: (line as any).category || "Collection",
      description: "",
      shortDescription: "",
      stock: 99,
    } as any);
    return { ...line, product };
  }), [cart, allProducts]);

  useEffect(() => {
    try {
      const savedCpn = sessionStorage.getItem("swachetna-applied-coupon");
      if (savedCpn) setAppliedCoupon(JSON.parse(savedCpn));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!cart.length) { router.replace("/cart"); return; }
    try {
      const stored = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      if (!isCheckoutDraft(parsed)) { router.replace("/checkout"); return; }
      setDraft(parsed);
      setLoading(false);
    } catch {
      router.replace("/checkout");
    }
  }, [ready, cart.length, router]);

  const saveOrderToStorageAndStrapi = async (paymentRef: string, paymentMethodTitle: string) => {
    if (!draft) return;
    const order = {
      reference: paymentRef,
      total: grandTotal,
      customer: {
        name: draft.customer.name,
        email: draft.customer.email,
        phone: draft.customer.phone,
        address: draft.customer.address,
        city: draft.customer.city,
        state: draft.customer.state,
        postalCode: draft.customer.postalCode,
      },
      items: lines.map((item) => ({
        id: item.product?.id || item.productId,
        name: item.product?.name || "Product",
        price: item.product?.price || 0,
        quantity: item.quantity,
        image: (item.product as any)?.image || "",
        sku: item.product?.sku || "",
      })),
      createdAt: new Date().toISOString(),
      demo: false,
      paymentMethod: paymentMethodTitle,
      status: "Pending",
    };

    const previous = JSON.parse(window.localStorage.getItem("swachetna-demo-orders") || "[]");
    const orders = Array.isArray(previous) ? previous : [];
    window.localStorage.setItem("swachetna-demo-orders", JSON.stringify([order, ...orders]));
    window.localStorage.setItem("swachetna-last-demo-order", JSON.stringify(order));
    window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    try {
      window.dispatchEvent(new Event("swachetna-orders-updated"));
    } catch { /* ignore */ }

    try {
      const { submitStrapiOrder } = await import("../../lib/strapi");
      const fullAddress = [draft.customer.address, draft.customer.city, draft.customer.state, draft.customer.postalCode].filter(Boolean).join(", ");
      await submitStrapiOrder({
        orderId: paymentRef,
        customer: draft.customer.name,
        customerEmail: draft.customer.email,
        customerPhone: draft.customer.phone,
        customerAddress: fullAddress,
        total: grandTotal,
        paymentMethod: paymentMethodTitle,
        items: order.items,
        status: "Pending",
      });
    } catch (strapiErr) {
      console.warn("Strapi order sync:", strapiErr);
    }
  };

  const handlePayment = async () => {
    if (!draft || !cart.length) { router.replace("/checkout"); return; }
    setProcessing(true);
    setError("");

    // Cash on Delivery
    if (method === "cod") {
      try {
        const reference = `SW-COD-${Date.now().toString().slice(-7)}`;
        await saveOrderToStorageAndStrapi(reference, "Cash on Delivery");
        router.push(`/order-confirmation?ref=${reference}`);
      } catch (e: any) {
        setProcessing(false);
        setError("Could not complete order. Please try again.");
      }
      return;
    }

    // Razorpay Online Payment (UPI / Card)
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.id) {
        throw new Error(orderData.error || "Failed to initiate Razorpay payment");
      }

      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Swachetna Foundation",
        description: `Order Payment (${cart.length} item${cart.length > 1 ? "s" : ""})`,
        image: "/favicon.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            if (response.razorpay_signature) {
              await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
            }
          } catch (e) {
            console.warn("Signature verification warning:", e);
          }
          const paymentRef = response.razorpay_payment_id || `SW-RZP-${Date.now().toString().slice(-7)}`;
          await saveOrderToStorageAndStrapi(paymentRef, `Razorpay (${PAYMENT_METHOD_LABELS[method] || "Online"})`);
          router.push(`/order-confirmation?ref=${paymentRef}&razorpay_id=${response.razorpay_payment_id || ""}`);
        },
        prefill: {
          name: draft.customer.name,
          email: draft.customer.email,
          contact: draft.customer.phone,
        },
        notes: {
          address: `${draft.customer.address}, ${draft.customer.city}, ${draft.customer.state}`,
        },
        theme: {
          color: "#7652c8",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setProcessing(false);
          setError(response.error?.description || "Payment failed. Please try again.");
        });
        rzp.open();
      } else {
        throw new Error("Razorpay SDK is loading. Please try again in a moment.");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setProcessing(false);
      setError(err?.message || "Payment processing failed. Please try again.");
    }
  };

  if (loading || !ready) return <main className={styles.page}><div className="container"><p className={styles.loading}>Loading checkout details…</p></div></main>;

  return <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    <main className={styles.page}>
      <div className="container">
        <Link className={styles.back} href="/checkout"><ArrowLeft size={15} /> Back to delivery details</Link>
        <header className={styles.header}>
          <span>CHECKOUT · STEP 2 OF 2</span>
          <h1>Choose your<br /><em>payment preference.</em></h1>
          <p>Delivery details are confirmed for {draft?.customer.name}. Pay securely via Razorpay UPI, Cards or choose Cash on delivery.</p>
        </header>

        <div className={styles.layout}>
          <section className={styles.paymentPanel} aria-labelledby="payment-method-title">
            <div className={styles.panelHeading}><span>02</span><div><h2 id="payment-method-title">Payment method</h2><p>Select a preferred payment option.</p></div></div>
            <div className={styles.methods}>
              {methods.map(({ id, title, detail, icon: Icon }) => <button key={id} type="button" className={`${styles.method} ${method === id ? styles.selected : ""}`} aria-pressed={method === id} onClick={() => { setMethod(id); setError(""); }}>
                <span className={styles.methodIcon}><Icon size={19} /></span>
                <span className={styles.methodText}><strong>{title}</strong><small>{detail}</small></span>
                <span className={styles.radio}>{method === id && <span />}</span>
              </button>)}
            </div>
            <div className={styles.demoNotice}><LockKeyhole size={17} /><p><strong>Razorpay Secure Payment</strong><span>Your transaction is encrypted and secured by Razorpay. UPI, Debit/Credit Card and Cash on delivery accepted.</span></p></div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="button" className={styles.payButton} onClick={handlePayment} disabled={processing}>
              {processing ? "Opening Razorpay…" : <>Pay {formatCurrency(grandTotal)} <ArrowRight size={17} /></>}
            </button>
            <p className={styles.secure}><Check size={14} /> 100% Safe &amp; Secure Checkout</p>
          </section>

        <aside className={styles.summary} aria-label="Order summary">
          <span className={styles.summaryEyebrow}>ORDER SUMMARY</span>
          <h2>Your order</h2>
          <div className={styles.items}>{lines.map(({ product, quantity }) => product && <div className={styles.item} key={product.id}>
            <span className={styles.quantity}>{quantity}</span><span className={styles.itemName}>{product.name}</span><strong>{formatCurrency(product.price * quantity)}</strong>
          </div>)}</div>
          <div className={styles.totalLines}>
            <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            {(() => {
              const totalGst = lines.reduce((acc, line) => {
                const p = line.product;
                const tax = getProductGst(p);
                const linePrice = p.price * line.quantity;
                const itemGst = (linePrice * tax.rate) / (100 + tax.rate);
                return acc + itemGst;
              }, 0);
              return (
                <div style={{ fontSize: "12px", color: "#6c5979", display: "flex", justifyContent: "space-between" }}>
                  <span>Includes GST (CGST + SGST)</span>
                  <strong>₹{Math.round(totalGst)}</strong>
                </div>
              );
            })()}
            {appliedCoupon && (
              <div style={{ color: "#1a8f4c" }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <strong>-{formatCurrency(discountAmount)}</strong>
              </div>
            )}
            <div><span>Estimated shipping</span><strong>{shipping ? formatCurrency(shipping) : "Free"}</strong></div>
            <small>Free shipping estimate over {formatCurrency(1500)}.</small>
            <div className={styles.grandTotal}><span>Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
          </div>
          <div className={styles.deliverTo}><span>DELIVERING TO</span><strong>{draft?.customer.name}</strong><p>{draft?.customer.address}, {draft?.customer.city}, {draft?.customer.state} {draft?.customer.postalCode}</p><small>{PAYMENT_METHOD_LABELS[method]} selected</small></div>
        </aside>
      </div>
    </div>
  </main>
</>;
}
