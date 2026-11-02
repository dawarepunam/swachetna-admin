" use client\;

import Link from \next/link\;
import { ArrowRight, Sparkles } from \lucide-react\;
import { useProducts } from \../../../context/ProductsContext\;
import ProductGrid from \../../products/ProductGrid/ProductGrid\;
import styles from \./FeaturedProducts.module.css\;

export default function FeaturedProducts() {
 const { products } = useProducts();
 // Display only first 2 rows (8 products: 4 cols x 2 rows on desktop, 2 cols x 4 rows on mobile)
 const homeProducts = products.slice(0, 8);

 return (
 <section className={styles.section}>
 <div className=\container\>
 <div className={styles.heading}>
 <div>
 <span className={styles.eyebrow}>CURATED FOR YOU</span>
 <h2>Thoughtful finds.</h2>
 <p className={styles.subheading}>Handmade treasures directly from rural self-help groups & artisans.</p>
 </div>

 <Link href=\/shop\ className={styles.viewAll}>
 View all products ({products.length}) <ArrowRight size={16} />
 </Link>
 </div>

 <ProductGrid products={homeProducts} showBuyNow />

 {/* Prominent View All Button in the bottom center */}
 <div className={styles.bottomCtaWrapper}>
 <Link href=\/shop\ className={styles.bigViewAllBtn}>
 <Sparkles size={16} />
 <span>Explore All {products.length} Handcrafted Products</span>
 <ArrowRight size={17} />
 </Link>
 </div>
 </div>
 </section>
 );
}
