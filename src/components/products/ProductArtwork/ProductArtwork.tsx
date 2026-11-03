import type { Product } from "../../../types/product";
import styles from "./ProductArtwork.module.css";

export default function ProductArtwork({ product, large = false }: { product: Product; large?: boolean }) {
  if (product.image) {
    return (
      <div
        className={`${styles.art} ${large ? styles.large : ""}`}
        style={{
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#fbf9fc",
          padding: large ? "16px" : "12px",
          aspectRatio: "1 / 1",
          width: "100%",
          height: "100%",
          boxSizing: "border-box"
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            maxWidth: "92%",
            maxHeight: "92%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            transition: "transform 0.4s ease",
            display: "block",
            margin: "auto"
          }}
          loading="lazy"
        />
        {product.subcategory ? (
          <span className={styles.artLabel}>{product.subcategory}</span>
        ) : (
          <span className={styles.artLabel}>{product.category}</span>
        )}
      </div>
    );
  }

  const isGift = product.category === "Gifting";
  const isSet = product.slug.includes("set") || product.slug.includes("collection");
  const isBowl = product.slug.includes("bowl");
  const isLinen = product.slug.includes("linen");
  return (
    <div className={`${styles.art} ${styles[isGift ? "gift" : isBowl ? "bowl" : isLinen ? "linen" : isSet ? "set" : "vase"]} ${large ? styles.large : ""}`} role="img" aria-label={`${product.name}, illustrative product artwork`}>
      <span className={styles.sun} />
      <span className={styles.plinth} />
      <svg className={styles.object} viewBox="0 0 420 440" aria-hidden="true">
        <defs>
          <linearGradient id="ceramic" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#eee1d0"/><stop offset=".48" stopColor="#bd9a78"/><stop offset="1" stopColor="#89664f"/></linearGradient>
          <linearGradient id="lavender" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#ded5ea"/><stop offset="1" stopColor="#87769f"/></linearGradient>
          <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f8f2e8"/><stop offset="1" stopColor="#d9c8ae"/></linearGradient>
          <filter id="shadow" x="-40%" y="-30%" width="180%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        <ellipse cx="210" cy="383" rx="105" ry="18" fill="#47382d" opacity=".18" filter="url(#shadow)"/>
        {isGift ? <g><path d="M105 194h210v164H105z" fill="url(#paper)"/><path d="M91 170h238v45H91z" fill="#9e7a90"/><path d="M189 169c-52-65 4-81 20-17 18-65 73-42 20 17" fill="none" stroke="#9e7a90" strokeWidth="17" strokeLinecap="round"/><path d="M202 170v187" stroke="#a9879a" strokeWidth="20"/><path d="M110 247h200v8H110z" fill="#c1a98d" opacity=".7"/></g>
          : isBowl ? <g><path d="M88 204c9 105 52 159 122 159s113-54 122-159c-69 25-175 25-244 0z" fill="url(#lavender)"/><ellipse cx="210" cy="207" rx="122" ry="43" fill="#f0e7df"/><ellipse cx="210" cy="211" rx="101" ry="28" fill="#aa958f"/><path d="M98 213c32 22 190 22 224 0" fill="none" stroke="#806f6b" strokeWidth="5" opacity=".6"/></g>
          : isLinen ? <g><path d="M76 147h265v218H76z" fill="url(#lavender)" transform="rotate(-7 210 256)"/><path d="M98 166v196M122 160v195M146 157v195M170 153v195M194 151v195M218 149v195M242 149v195M266 149v195M290 151v195" stroke="#f6f0e8" strokeWidth="3" opacity=".55"/><path d="M78 196h264M81 235h263M84 275h261M87 315h259" stroke="#72617f" strokeWidth="3" opacity=".25"/></g>
          : isSet ? <g><ellipse cx="145" cy="224" rx="47" ry="27" fill="#e9dfd0"/><path d="M98 224v105q0 21 47 21t47-21V224" fill="url(#paper)"/><ellipse cx="145" cy="224" rx="47" ry="19" fill="#c9b9a3"/><path d="M211 176h86v150h-86z" fill="url(#lavender)"/><ellipse cx="254" cy="176" rx="43" ry="16" fill="#f3e9dc"/><path d="M211 180q43 23 86 0" fill="none" stroke="#927f9f" strokeWidth="5"/><path d="M117 280h56" stroke="#a68b75" strokeWidth="5" opacity=".7"/></g>
          : <g><path d="M171 115h78l-9 42c0 20 58 66 65 121 8 58-21 92-95 92s-103-34-95-92c7-55 65-101 65-121z" fill="url(#ceramic)"/><ellipse cx="210" cy="115" rx="39" ry="12" fill="#f3eadf"/><ellipse cx="210" cy="117" rx="28" ry="6" fill="#80624f"/><path d="M133 292q77 21 154 0" fill="none" stroke="#f1e2cf" strokeWidth="7" opacity=".46"/><path d="M170 143h75" stroke="#fff" strokeWidth="3" opacity=".35"/></g>}
      </svg>
      <span className={styles.artLabel}>{product.category}</span>
    </div>
  );
}
