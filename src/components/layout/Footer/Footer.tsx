"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { useProducts } from "../../../context/ProductsContext";
import styles from "./Footer.module.css";

const linkGroups = [
  {
    title: "EXPLORE",
    links: [
      ["Shop All Products", "/shop"],
      ["Artisanal Collections", "/categories"],
      ["Instant Search", "/search"],
      ["My Wishlist", "/wishlist"],
      ["Shopping Bag", "/cart"],
    ],
  },
  {
    title: "SWACHETNA",
    links: [
      ["Our Mission & Story", "/about"],
      ["Grassroots Programs", "/#foundation-in-action"],
      ["Contact & Support", "/contact"],
      ["FAQs & Guide", "/faq"],
      ["Live Order Tracking", "/track-order"],
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      ["Track My Order", "/track-order"],
      ["Privacy Policy", "/policies#privacy"],
      ["Terms of Service", "/policies#terms"],
      ["Shipping & Delivery", "/policies#shipping"],
      ["Returns & Refunds", "/policies#returns"],
    ],
  },
];

export default function Footer() {
  const { settings } = useProducts();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandColumn}>
          <Link href="/" className={styles.logoLink} aria-label="Swachetna Foundation home">
            <Image
              src="/images/swachetna-purple.webp"
              alt="Swachetna Foundation"
              width={220}
              height={82}
              className={styles.footerLogo}
            />
          </Link>
          <p className={styles.brandTagline}>
            A registered non-profit social welfare organization (est. 2023, Pune) committed to building a stronger, healthier, and self-reliant India through education, women empowerment, healthcare, and sustainable livelihood.
          </p>
          <div className={styles.note}>
            <Heart size={14} className={styles.heartIcon} aria-hidden="true" />
            <span>100% Handcrafted by rural self-help groups &amp; artisans.</span>
          </div>
        </div>

        {linkGroups.map((group) => (
          <nav className={styles.column} key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
          </nav>
        ))}
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p>© 2026 {settings.organization || "Swachetna Foundation"}. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/about">About Us</Link>
            <span>•</span>
            <Link href="/faq">Help &amp; FAQs <ArrowUpRight size={13} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
