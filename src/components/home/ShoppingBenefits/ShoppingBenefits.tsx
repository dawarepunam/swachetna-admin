import { Heart, Sparkles, CheckCircle2, ShieldCheck, TrendingUp, HandHeart } from "lucide-react";
import styles from "./ShoppingBenefits.module.css";

const whyPoints = [
  {
    icon: HandHeart,
    badge: "100% DIRECT IMPACT",
    title: "Compassion Turned into Action",
    description:
      "Guided by Mahatma Gandhi's principle — 'If you want to change the world, start with yourself' — we bridge socio-economic gaps directly on the ground across vulnerable urban and rural communities.",
  },
  {
    icon: CheckCircle2,
    badge: "FAIR ARTISAN WAGES",
    title: "Dignity Over Charity",
    description:
      "Every handcrafted product on this store directly finances rural self-help groups, empowering women artisans and farmer families with sustainable, long-term livelihoods and independence.",
  },
  {
    icon: Sparkles,
    badge: "HERITAGE & PURITY",
    title: "Pure, Authentic Traditions",
    description:
      "From wood-churned oils and sun-dried pickles to hand-molded terracotta pottery and handwoven khadi linen — every piece is crafted with sacred care, free from synthetic chemicals.",
  },
  {
    icon: TrendingUp,
    badge: "TRANSPARENT ACCOUNTABILITY",
    title: "Measurable Social Growth",
    description:
      "Every purchase powers grassroots campaigns: education kits for tribal children, nutritious meals at shelter homes, and preventive cervical cancer screening camps for underprivileged women.",
  },
];

export default function ShoppingBenefits() {
  return (
    <section className={styles.section} id="why-swachetna">
      <div className="container">
        <div className={styles.introWrapper}>
          <div className={styles.introLeft}>
            <span className={styles.eyebrow}>
              <Heart size={14} className={styles.heartIcon} />
              WHY SWACHETNA FOUNDATION
            </span>

            <h2>
              Building a stronger,
              <em> healthier & self-reliant India.</em>
            </h2>
          </div>

          <p className={styles.introRight}>
            Swachetna Foundation is a registered non-profit social welfare organization established in Pune (2023). We don’t just deliver aid — we cultivate self-reliance (Aatmanirbhar Bharat) by creating community-owned ecosystems of dignity, learning, health, and fair livelihood.
          </p>
        </div>

        <div className={styles.grid}>
          {whyPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className={styles.item} key={item.title}>
                <div className={styles.itemHeader}>
                  <div className={styles.iconBox}>
                    <Icon size={22} />
                  </div>
                  <span className={styles.indexNumber}>0{index + 1}</span>
                </div>

                <span className={styles.badge}>{item.badge}</span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
