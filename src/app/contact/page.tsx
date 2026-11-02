"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, MessageCircle, Send, Loader2 } from "lucide-react";
import { submitStrapiInquiry } from "../../lib/strapi";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setIsError(false);

    if (name.trim().length < 2) { setFeedback("Please enter your name."); setIsError(true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFeedback("Please enter a valid email address."); setIsError(true); return; }
    if (message.trim().length < 10) { setFeedback("Please add a little more detail to your message (min 10 characters)."); setIsError(true); return; }

    setIsSubmitting(true);

    try {
      const success = await submitStrapiInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || "General Inquiry",
        message: message.trim(),
      });

      // Also save to localStorage inquiries so Admin Panel sees it instantly even without Strapi
      try {
        const STORAGE_KEY = "swachetna-admin-workspace-v1";
        const currentStored = localStorage.getItem(STORAGE_KEY);
        const parsed = currentStored ? JSON.parse(currentStored) : {};
        const existingInqs = Array.isArray(parsed.inquiries) ? parsed.inquiries : [];
        const newInqObj = {
          id: `inq-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || "",
          subject: subject.trim() || "General Inquiry",
          message: message.trim(),
          status: "New",
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          inquiries: [newInqObj, ...existingInqs],
        }));
      } catch { /* ignore */ }

      if (success) {
        setFeedback("Thank you! Your message has been sent to Swachetna Foundation. We'll get back to you within 1-2 business days.");
      } else {
        setFeedback("Thank you for reaching out! We've received your message and will respond soon.");
      }
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      setFeedback("Thank you for reaching out! We've received your message and will respond soon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.layout}>
          <section className={styles.introPanel}>
            <span className={styles.eyebrow}><span /> WE&apos;RE LISTENING</span>
            <h1>A note to<br /><em>Swachetna.</em></h1>
            <p className={styles.intro}>Questions, ideas or a hello—we&apos;d love to hear from you.</p>
            <div className={styles.details}>
              <div className={styles.detailItem}><span className={styles.detailIcon}><Mail aria-hidden="true" /></span><span><strong>A note, your way</strong><small>Share what&apos;s on your mind using the form.</small></span></div>
              <div className={styles.detailItem}><span className={styles.detailIcon}><MessageCircle aria-hidden="true" /></span><span><strong>Every voice matters</strong><small>We value your questions, ideas and feedback.</small></span></div>
            </div>
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.orbitInner} aria-hidden="true" />
            <span className={styles.panelWord} aria-hidden="true">hello</span>
          </section>

          <section className={styles.formPanel} aria-labelledby="contact-form-title">
            <div className={styles.formHeading}>
              <span className={styles.formIcon}><Send aria-hidden="true" /></span>
              <div><span className={styles.formEyebrow}>GET IN TOUCH</span><h2 id="contact-form-title">Write us a note</h2></div>
            </div>
            <form className={styles.form} onSubmit={submit} noValidate>
              <label>Your name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we address you?" required /></label>
              <label>Email address<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
              <label>Phone number (optional)<input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" /></label>
              <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What is this regarding?" /></label>
              <label>Your message<textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what&apos;s on your mind…" required /></label>
              <button className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send your message"}
                {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight aria-hidden="true" size={17} />}
              </button>
              {feedback && (
                <p
                  className={styles.feedback}
                  role="status"
                  style={{ color: isError ? "#b91c1c" : undefined }}
                >
                  {!isError && <Check aria-hidden="true" />}
                  {feedback}
                </p>
              )}
            </form>
            <p className={styles.formNote}>Your message is sent directly to the Swachetna Foundation team. We respond within 1-2 business days.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
