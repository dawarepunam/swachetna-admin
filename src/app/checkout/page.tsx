"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, MapPin, CheckCircle2, UserCheck } from "lucide-react";
import { formatCurrency, getProductGst } from "../../data/products";
import { useStore } from "../../context/StoreContext";
import { CHECKOUT_DRAFT_KEY, type CheckoutCustomer, type CheckoutDraft, type CheckoutField } from "../../types/checkout";
import styles from "./checkout.module.css";

const initial: CheckoutCustomer = { name: "", email: "", phone: "", address: "", city: "", state: "", postalCode: "" };
const labels: Record<CheckoutField, string> = { name: "Full name", email: "Email address", phone: "Phone number", address: "Street address", city: "City", state: "State", postalCode: "PIN code" };

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, ready } = useStore();
  const [customer, setCustomer] = useState<CheckoutCustomer>(initial);
  const [errors, setErrors] = useState<Partial<Record<CheckoutField, string>>>({});
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [savedUser, setSavedUser] = useState<any>(null);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [formError, setFormError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description?: string } | null>(null);

  useEffect(() => {
    try {
      const savedCpn = sessionStorage.getItem("swachetna-applied-coupon");
      if (savedCpn) setAppliedCoupon(JSON.parse(savedCpn));
    } catch { /* ignore */ }
  }, []);

  const discountAmount = appliedCoupon ? Math.min(subtotal, appliedCoupon.discount) : 0;
  const shipping = (subtotal - discountAmount) >= 1500 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  // Auto-fill details if user is logged in or has saved address
  useEffect(() => {
    try {
      const uStr = localStorage.getItem("swachetna-demo-user");
      const addrStr = localStorage.getItem("swachetna-saved-address");
      let uData: any = null;
      let addrData: any = null;

      if (uStr) {
        uData = JSON.parse(uStr);
        setSavedUser(uData);
      }
      if (addrStr) {
        addrData = JSON.parse(addrStr);
        setHasSavedAddress(true);
      }

      setCustomer((prev) => ({
        ...prev,
        name: uData?.name || prev.name,
        email: uData?.email || prev.email,
        phone: uData?.phone || prev.phone,
        address: addrData?.line || prev.address,
        city: addrData?.city || prev.city,
        state: addrData?.state || prev.state,
        postalCode: addrData?.postalCode || prev.postalCode,
      }));
    } catch {
      /* ignore */
    }
  }, []);

  const update = (field: CheckoutField, value: string) => setCustomer((current) => ({ ...current, [field]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<CheckoutField, string>> = {};
    if (customer.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) nextErrors.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(customer.phone.replace(/\D/g, ""))) nextErrors.phone = "Enter a valid 10-digit Indian phone number.";
    if (customer.address.trim().length < 5) nextErrors.address = "Enter your street address.";
    if (customer.city.trim().length < 2) nextErrors.city = "Enter your city.";
    if (customer.state.trim().length < 2) nextErrors.state = "Enter your state.";
    if (!/^\d{6}$/.test(customer.postalCode.trim())) nextErrors.postalCode = "Enter a valid 6-digit PIN code.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !cart.length) return;
    if (!consentAccepted) { setFormError("Please confirm your address details."); return; }

    try {
      // Save address to local account if chosen
      if (saveAddressToAccount) {
        const addrToSave = {
          line: customer.address.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          postalCode: customer.postalCode.trim(),
        };
        localStorage.setItem("swachetna-saved-address", JSON.stringify(addrToSave));
      }

      const draft: CheckoutDraft = { customer, createdAt: new Date().toISOString() };
      window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
      setFormError("");
      router.push("/payment");
    } catch {
      setFormError("Could not save checkout details. Please check browser storage settings.");
    }
  };

  if (!ready) return <main className={styles.page}><div className="container"><p>Loading checkout...</p></div></main>;
  if (!cart.length) return <main className={styles.page}><div className="container">
    <Link className={styles.back} href="/cart"><ArrowLeft size={14} /> Return to your bag</Link>
    <header><span>YOUR BAG IS EMPTY</span><h1>Ready when<br /><em>you are.</em></h1><p>Add an item to your bag before continuing to checkout.</p></header>
    <section className={styles.empty}><h2>Nothing to check out yet.</h2><Link href="/shop">Explore the collection</Link></section>
  </div></main>;

  return (
    <main className={styles.page}>
      <div className="container">
        <Link className={styles.back} href="/cart"><ArrowLeft size={14} /> Back to your bag</Link>
        <header>
          <span>SECURE CHECKOUT · STEP 1 OF 2</span>
          <h1>Confirm your<br /><em>delivery address.</em></h1>
          <p>Deliver handcrafted treasures safely to your doorstep. Review or update your delivery details below.</p>
        </header>

        {savedUser && (
          <div style={{
            background: "#f7f2f9",
            border: "1px solid #ebdfee",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "#4a3258"
          }}>
            <UserCheck size={18} style={{ color: "#744b82" }} />
            <span>
              Signed in as <strong>{savedUser.name}</strong> ({savedUser.email}).
              {hasSavedAddress && " Your saved shipping address is pre-filled below."}
            </span>
          </div>
        )}

        <div className={styles.layout}>
          <form onSubmit={submit} noValidate autoComplete="off">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className={styles.step}>01 · SHIPPING &amp; DELIVERY ADDRESS</span>
              {hasSavedAddress && (
                <span style={{ fontSize: "11px", color: "#166534", background: "#f0fdf4", padding: "3px 8px", borderRadius: "99px", fontWeight: "600" }}>
                  <CheckCircle2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                  Saved Address Loaded
                </span>
              )}
            </div>

            <div className={styles.fields}>
              {(Object.keys(labels) as CheckoutField[]).map((field) => (
                <label key={field} className={field === "address" ? styles.full : ""}>
                  {labels[field]}
                  <input
                    type={field === "email" ? "email" : "text"}
                    inputMode={field === "phone" || field === "postalCode" ? "numeric" : undefined}
                    autoComplete="off"
                    value={customer[field]}
                    aria-invalid={Boolean(errors[field])}
                    onChange={(event) => update(field, event.target.value)}
                    required
                  />
                  {errors[field] && <small className={styles.error}>{errors[field]}</small>}
                </label>
              ))}
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#54465b", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={saveAddressToAccount}
                  onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                />
                <span>Save this address for fast 1-click checkout in my account</span>
              </label>

              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  aria-invalid={Boolean(formError)}
                  onChange={(event) => { setConsentAccepted(event.target.checked); if (event.target.checked) setFormError(""); }}
                />
                <span>I confirm that the delivery address and contact information above are accurate.</span>
              </label>
            </div>

            {formError && <small className={styles.error} role="alert">{formError}</small>}

            <button className={styles.place} type="submit">
              Confirm &amp; Proceed to Payment <ArrowRight size={17} />
            </button>
          </form>

          <aside className={styles.summary}>
            <span className={styles.step}>02 · ORDER SUMMARY</span>
            {(() => {
              const estimatedGst = cart.reduce((acc, line) => {
                const price = (line as any).price || 0;
                const rate = (line as any).gstRate !== undefined ? (line as any).gstRate : 12;
                const lineTotal = price * line.quantity;
                return acc + ((lineTotal * rate) / (100 + rate));
              }, 0);
              return (
                <>
                  <div><span>Items</span><strong>{cart.reduce((sum, line) => sum + line.quantity, 0)}</strong></div>
                  <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
                  <div style={{ fontSize: "12px", color: "#6c5979", display: "flex", justifyContent: "space-between" }}>
                    <span>Includes GST (CGST + SGST)</span>
                    <strong>₹{Math.round(estimatedGst)}</strong>
                  </div>
                  {appliedCoupon && (
                    <div style={{ color: "#166534" }}>
                      <span>Coupon ({appliedCoupon.code})</span>
                      <strong>−{formatCurrency(discountAmount)}</strong>
                    </div>
                  )}
                  <div><span>Shipping</span><strong>{shipping ? formatCurrency(shipping) : "Free"}</strong></div>
                  <small>Free shipping on orders over {formatCurrency(1500)}.</small>
                  <div className={styles.total}><span>Total</span><strong>{formatCurrency(grandTotal)}</strong></div>
                </>
              );
            })()}
            <small><ShieldCheck size={14} /> 100% Safe &amp; Encrypted Checkout.</small>
          </aside>
        </div>
      </div>
    </main>
  );
}
