"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, HeartHandshake } from "lucide-react";
import { useProducts } from "../../../context/ProductsContext";
import styles from "./CommunityWork.module.css";

const fallbackStories = [
  {
    image: "/images/community-grocery-drive.jpeg",
    alt: "Swachetna Foundation volunteers at a grocery donation drive",
    tag: "ANNAPURNA • FOOD SECURITY",
    title: "Grocery Donation Drive",
    description: "Providing essential grocery packages, grains, and nutritional care directly to students at C. R. Ranganathan School for Deaf & Mute in Pune.",
    impactStat: "150+ Families Supported",
  },
  {
    image: "/images/anna-seva.jpeg",
    alt: "Volunteers sharing food at a community meal",
    tag: "ANNAPURNA • COMMUNITY MEALS",
    title: "Nutritious Anna Seva",
    description: "Wholesome hot meals, seasonal fruits, and warm roses shared with residents and children at Maher Vatsalyadham Shelter Home, Pune.",
    impactStat: "500+ Nutritious Meals Served",
  },
  {
    image: "/images/student-lamp-program.jpeg",
    alt: "Students decorating handmade lamps for a festive sale",
    tag: "SWAVALAMBAN • ARTISAN SKILLS",
    title: "Festive Lamp & Handicraft Program",
    description: "Hands-on diya painting, festive hamper packaging, and micro-entrepreneurship training to give specially-abled youth creative self-reliance.",
    impactStat: "100% Student-Crafted Products",
  },
];

export default function CommunityWork() {
  const { campaigns } = useProducts();

  const stories = campaigns.length > 0
    ? campaigns.filter((c) => c.status === "Active").map((c, idx) => ({
        image: fallbackStories[idx % fallbackStories.length].image,
        alt: c.name,
        tag: c.area ? `COMMUNITY • ${c.area.toUpperCase()}` : "GRASSROOTS INITIATIVE",
        title: c.name,
        description: `Active grassroots development project in Pune by Swachetna Foundation.`,
        impactStat: "Ongoing Community Program",
      }))
    : fallbackStories;

  return (
    <section className={styles.section} id="foundation-in-action">
      <div className="container">
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              <Sparkles size={13} className={styles.sparkleIcon} />
              THE FOUNDATION IN ACTION
            </span>
            <h2 id="community-work-title">
              Real work.<br />
              <em>Right in our community.</em>
            </h2>
            <p className={styles.subheading}>
              Inspiring stories from Swachetna Foundation’s on-ground grassroots programs in Pune, fostering dignity and self-reliance.
            </p>
          </div>
          <a
            href="https://swachetna.org/"
            target="_blank"
            rel="noreferrer"
            className={styles.headerCta}
          >
            <span>Visit swachetna.org</span>
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className={styles.grid} aria-labelledby="community-work-title">
          {stories.map((story) => (
            <article className={styles.card} key={story.title}>
              <div className={styles.image}>
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 800px) 50vw, 33vw"
                />
                <span className={styles.tag}>{story.tag}</span>
              </div>
              <div className={styles.copy}>
                <div className={styles.statPill}>
                  <HeartHandshake size={14} className={styles.statIcon} />
                  <span>{story.impactStat}</span>
                </div>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
                <Link href="/about" className={styles.cardLink}>
                  <span>Explore Our Mission</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.caption}>
          ✨ Authentic on-ground photographs from Swachetna Foundation’s ongoing social welfare programs in Pune, Maharashtra.
        </p>
      </div>
    </section>
  );
}
