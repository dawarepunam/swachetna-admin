import { BookOpen, HeartPulse, Sprout, Users, Briefcase, Award, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./ImpactSection.module.css";

const areas = [
  {
    icon: Sprout,
    tag: "PILLAR 01",
    title: "Community Wellbeing & Annapurna",
    subtitle: "Nutrition & Basic Food Security",
    text: "Providing consistent grocery kits, fresh meals, and nutritional drives to special schools, elderly care shelters, and vulnerable households across Pune.",
    stats: "10,000+ Meals & Groceries Shared"
  },
  {
    icon: BookOpen,
    tag: "PILLAR 02",
    title: "Adhyayan & Inclusive Education",
    subtitle: "Foundational & Digital Learning",
    text: "Equipping rural and tribal children with educational kits, notebooks, digital skills, and moral values to break the cycle of generational poverty.",
    stats: "2,500+ Children Supported"
  },
  {
    icon: HeartPulse,
    tag: "PILLAR 03",
    title: "Arogya & Women's Health",
    subtitle: "Preventive Care & Hygiene Camps",
    text: "Organizing cervical cancer screenings, menstrual hygiene workshops, doctor consultations, and health awareness drives in underserved slum settlements.",
    stats: "1,800+ Women Screened"
  },
  {
    icon: Briefcase,
    tag: "PILLAR 04",
    title: "Aatmanirbhar & Swavalamban",
    subtitle: "Artisan Livelihoods & Self-Reliance",
    text: "Training women in sewing, handicrafts, organic food processing, and traditional pottery, giving them dignified income and market access.",
    stats: "500+ Women Artisans Empowered"
  },
  {
    icon: Users,
    tag: "PILLAR 05",
    title: "Annadata & Farmer Upliftment",
    subtitle: "Sustainable Agriculture & Support",
    text: "Backing local farming families with regenerative organic practices, fair market channels, seed support, and community agricultural resilience.",
    stats: "350+ Farmer Families Reached"
  },
  {
    icon: ShieldCheck,
    tag: "PILLAR 06",
    title: "Vasudharam & Pranitva",
    subtitle: "Environmental & Animal Welfare",
    text: "Tree plantations, waste awareness, biodiversity protection, and medical aid & compassionate feeding for stray animals and birds.",
    stats: "100% Grassroots Commitment"
  }
];

export default function ImpactSection() {
  return (
    <section className={styles.section} id="areas-of-work">
      <div className="container">
        <div className={styles.top}>
          <div>
            <span className={styles.eyebrow}>TRANSFORMING LIVES ON GROUND</span>
            <h2>Our Areas of Work.<br /><em>Care in action, real change.</em></h2>
          </div>
          <p className={styles.topDescription}>
            Swachetna Foundation (est. 2023, Pune) operates with an unwavering commitment to bridging socio-economic gaps and fostering a stronger, healthier, and self-reliant India.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {areas.map(({ icon: Icon, tag, title, subtitle, text, stats }) => (
            <article key={title} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrapper}>
                  <Icon size={24} className={styles.icon} />
                </div>
                <span className={styles.cardTag}>{tag}</span>
              </div>

              <div className={styles.cardBody}>
                <span className={styles.cardSubtitle}>{subtitle}</span>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardText}>{text}</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.statsBadge}>
                  <Award size={13} className={styles.badgeIcon} />
                  <span>{stats}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.actionBanner}>
          <div className={styles.actionText}>
            <h4>Want to collaborate or volunteer with Swachetna Foundation?</h4>
            <p>Join our grassroots programs and help us empower more lives in Pune and beyond.</p>
          </div>
          <Link href="/contact" className={styles.actionBtn}>
            Get Involved With Us <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
