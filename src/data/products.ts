import type { Product } from "../types/product";

export const products: Product[] = [
  // ==========================================
  // 1. FOOD & NGO PRODUCTS (Pickles, Laddus, Papads, Spices)
  // ==========================================
  {
    id: "product-010",
    slug: "traditional-mango-pickle",
    name: "Gaon-style Homemade Traditional Pickle",
    category: "Food & NGO Products",
    subcategory: "Traditional Pickles",
    price: 299,
    originalPrice: 380,
    badge: "Bestseller",
    shortDescription: "Prepared by Swachetna self-help women groups using authentic traditional recipes.",
    description: "Prepared by Swachetna self-help women groups using authentic traditional recipes. Made with fresh raw mangoes, sun-dried lemons and hand-ground spices in mustard oil. Zero preservatives, sun-dried in clay jars.",
    sku: "SW-FD-010",
    stock: 35,
    featuredRank: 1,
    image: "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg",
    images: [
      "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg",
      "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-bowl-masala.jpg",
      "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jars-pantry.jpg"
    ],
    colors: ["Raw Mango (कैरी)", "Spicy Lemon (लिंबू)", "Green Chilli (मिरची)", "Garlic Infused (लसूण)"],
    sizes: ["250g Glass Jar", "500g Glass Jar", "1kg Family Pack"],
    sizePrices: {
      "250g Glass Jar": 299,
      "500g Glass Jar": 549,
      "1kg Family Pack": 999
    },
    variants: [
      {
        name: "Raw Mango (कैरी)",
        hex: "#b84534",
        images: [
          "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg",
          "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-bowl-masala.jpg",
          "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jars-pantry.jpg"
        ]
      },
      {
        name: "Spicy Lemon (लिंबू)",
        hex: "#d49a37",
        images: [
          "/images/collections/food-ngo/traditional-pickles/lemon/lemon-pickle-jar.jpg",
          "/images/collections/food-ngo/traditional-pickles/lemon/lemon-pickle-slice-texture.jpg"
        ]
      },
      {
        name: "Green Chilli (मिरची)",
        hex: "#2e7d32",
        images: [
          "/images/collections/food-ngo/traditional-pickles/green-chilli/green-chilli-pickle-jar.jpg",
          "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-bowl-masala.jpg"
        ]
      },
      {
        name: "Garlic Infused (लसूण)",
        hex: "#8b5e3c",
        images: [
          "/images/collections/food-ngo/traditional-pickles/garlic/garlic-pickle-pot.jpg",
          "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jars-pantry.jpg"
        ]
      }
    ]
  },
  {
    id: "product-011",
    slug: "nutritious-dryfruit-ding-laddu",
    name: "Organic Dink & Dryfruit Energy Laddu",
    category: "Food & NGO Products",
    subcategory: "Nutritious Sweets",
    price: 499,
    originalPrice: 650,
    badge: "Popular",
    shortDescription: "Power-packed with almonds, cashews, dink and pure desi jaggery.",
    description: "Power-packed with almonds, cashews, edible gum (dink), dry coconut, anjeer and pure desi jaggery. Perfect for boosting immunity, joint strength and energy. Handmade fresh without white sugar.",
    sku: "SW-FD-011",
    stock: 28,
    featuredRank: 2,
    image: "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg",
    images: [
      "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg",
      "/images/collections/food-ngo/dryfruit-laddus/almond/almond-laddu-texture.jpg"
    ],
    colors: ["Mixed Dryfruits", "Almond (बदाम)", "Anjeer (अंजीर)"],
    sizes: ["250g Box (8 pcs)", "500g Box (16 pcs)", "1kg Family Gift Pack"],
    sizePrices: {
      "250g Box (8 pcs)": 499,
      "500g Box (16 pcs)": 949,
      "1kg Family Gift Pack": 1799
    },
    variants: [
      {
        name: "Mixed Dryfruits",
        hex: "#8b5e3c",
        images: [
          "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg",
          "/images/collections/food-ngo/dryfruit-laddus/almond/almond-laddu-texture.jpg"
        ]
      },
      {
        name: "Almond (बदाम)",
        hex: "#d49a37",
        images: [
          "/images/collections/food-ngo/dryfruit-laddus/almond/almond-laddu-texture.jpg",
          "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg"
        ]
      },
      {
        name: "Anjeer (अंजीर)",
        hex: "#5c4033",
        images: [
          "/images/collections/food-ngo/dryfruit-laddus/anjeer/anjeer-laddu-box.jpg",
          "/images/collections/food-ngo/dryfruit-laddus/mixed-fruits/dryfruit-laddus-plate.jpg"
        ]
      }
    ]
  },
  {
    id: "product-015",
    slug: "sun-dried-crisp-urad-papad",
    name: "Sun-Dried Crisp Urad Dal Papad",
    category: "Food & NGO Products",
    subcategory: "Handmade Papads",
    price: 199,
    originalPrice: 250,
    shortDescription: "Hand-rolled by rural women artisans, sun-dried on clean cotton mats.",
    description: "Hand-rolled by rural women artisans, sun-dried on clean cotton mats. Seasoned with crushed black pepper, asafoetida (hing) and cumin seeds.",
    sku: "SW-FD-015",
    stock: 50,
    featuredRank: 5,
    image: "/images/collections/food-ngo/handmade-papads/urad-dal-papad-crisp.jpg",
    images: ["/images/collections/food-ngo/handmade-papads/urad-dal-papad-crisp.jpg"],
    colors: ["Black Pepper Hing", "Mild Cumin"],
    sizes: ["250g Pack", "500g Pack"],
    sizePrices: {
      "250g Pack": 199,
      "500g Pack": 369
    }
  },
  {
    id: "product-018",
    slug: "stone-ground-goda-masala",
    name: "Stone-Ground Authentic Goda / Kala Masala",
    category: "Food & NGO Products",
    subcategory: "Spices & Masala",
    price: 249,
    originalPrice: 320,
    shortDescription: "Traditional 24-spice Maharashtrian goda masala roasted in pure sesame oil.",
    description: "Traditional 24-spice Maharashtrian goda masala roasted in pure sesame oil and stone-pounded for rich aroma and deep dark color.",
    sku: "SW-FD-018",
    stock: 40,
    featuredRank: 6,
    image: "/images/collections/food-ngo/spices-masala/goda-masala-roasted-spices.jpg",
    images: ["/images/collections/food-ngo/spices-masala/goda-masala-roasted-spices.jpg"],
    colors: ["Authentic Maharashtrian Blend"],
    sizes: ["200g Pouch", "500g Pouch"],
    sizePrices: {
      "200g Pouch": 249,
      "500g Pouch": 580
    }
  },

  // ==========================================
  // 2. HOME & LIVING (Decor, Pottery, Linen, Dining)
  // ==========================================
  {
    id: "product-001",
    slug: "earth-toned-handcrafted-piece",
    name: "Earth-Toned Terracotta Ceramic Vase",
    category: "Home & Living",
    subcategory: "Decor & Pottery",
    price: 899,
    originalPrice: 1199,
    badge: "Bestseller",
    shortDescription: "A quiet, sculptural accent for your everyday spaces.",
    description: "Hand-finished in a warm earthy glaze, this sculptural ceramic vase brings a gentle sense of calm to shelves, tables and thoughtful corners. Handcrafted by master potters from rural Maharashtra.",
    sku: "SW-HL-001",
    stock: 15,
    featuredRank: 3,
    image: "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg",
    images: [
      "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg",
      "/images/collections/home-living/decor-pottery/terracotta-vase-side-glaze.jpg"
    ],
    colors: ["Terracotta Brown", "Matte Ochre"],
    sizes: ["Standard (8-inch)", "Large (11-inch)"],
    variants: [
      {
        name: "Terracotta Brown",
        hex: "#8b5e3c",
        images: [
          "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg",
          "/images/collections/home-living/decor-pottery/terracotta-vase-side-glaze.jpg"
        ]
      },
      {
        name: "Matte Ochre",
        hex: "#d49a37",
        images: [
          "/images/collections/home-living/decor-pottery/matte-ochre-vase.jpg",
          "/images/collections/home-living/decor-pottery/terracotta-vase-side-glaze.jpg"
        ]
      }
    ]
  },
  {
    id: "product-005",
    slug: "lavender-table-linen",
    name: "Organic Khadi Cotton Table Linen",
    category: "Home & Living",
    subcategory: "Table Linen",
    price: 1099,
    originalPrice: 1399,
    shortDescription: "Soft woven texture for a dining table made to gather around.",
    description: "Woven on traditional handlooms from pure organic cotton yarn. Breathable, durable and dyed with natural plant extracts for daily dinners and festive feasts.",
    sku: "SW-HL-005",
    stock: 12,
    featuredRank: 7,
    image: "/images/collections/home-living/table-linen/lavender-linen-table-view.jpg",
    images: [
      "/images/collections/home-living/table-linen/lavender-linen-table-view.jpg",
      "/images/collections/home-living/table-linen/lavender-linen-cotton-texture.jpg"
    ],
    colors: ["Pastel Lavender", "Sage Green"],
    sizes: ["4-Seater (140x180cm)", "6-Seater (140x220cm)"]
  },
  {
    id: "product-007",
    slug: "hand-finished-serving-bowl",
    name: "Hand-Molded Ceramic Serving Bowl",
    category: "Home & Living",
    subcategory: "Kitchen & Dining",
    price: 1399,
    originalPrice: 1699,
    shortDescription: "A generous serving bowl with softly irregular rim and earthy glaze.",
    description: "A generous serving bowl with a softly irregular rim and a hand-finished glaze. Microwave and dishwasher safe, crafted with lead-free, non-toxic clays.",
    sku: "SW-HL-007",
    stock: 9,
    featuredRank: 8,
    image: "/images/collections/home-living/kitchen-dining/ceramic-serving-bowl.jpg",
    images: ["/images/collections/home-living/kitchen-dining/ceramic-serving-bowl.jpg"],
    colors: ["Rustic Glaze", "Chalk White"],
    sizes: ["Medium (800ml)", "Large (1.5 Litre)"]
  },
  {
    id: "product-009",
    slug: "brass-carved-puja-diya",
    name: "Traditional Brass Carved Diya Stand",
    category: "Home & Living",
    subcategory: "Decor & Pottery",
    price: 649,
    originalPrice: 850,
    shortDescription: "A pure brass oil lamp with exquisite petal carvings.",
    description: "A pure brass oil lamp with exquisite petal carvings. Cast using traditional sand-moulding methods to bring auspicious warmth into your living room or temple.",
    sku: "SW-HL-009",
    stock: 22,
    featuredRank: 9,
    image: "/images/collections/home-living/brass-handicrafts/brass-carved-puja-diya.jpg",
    images: ["/images/collections/home-living/brass-handicrafts/brass-carved-puja-diya.jpg"],
    colors: ["Antique Brass Gold"],
    sizes: ["Small (4 inch)", "Standard (6 inch)"]
  },

  // ==========================================
  // 3. GIFTING (Hampers, Gift Boxes)
  // ==========================================
  {
    id: "product-012",
    slug: "thoughtful-artisan-gift-hamper",
    name: "The Thoughtful Artisan Festive Hamper",
    category: "Gifting",
    subcategory: "Festive Hampers",
    price: 1299,
    originalPrice: 1560,
    badge: "Bestseller",
    shortDescription: "A considered festive collection packed in a reusable pinewood box.",
    description: "A curated gift box containing a hand-carved brass diya, organic honey jar, hand-rolled incense sticks, and dry fruit laddus. Packed in an eco-friendly pinewood box tied with golden jute ribbon.",
    sku: "SW-GF-012",
    stock: 20,
    featuredRank: 4,
    image: "/images/collections/gifting/festive-hampers/festive-hamper-main.jpg",
    images: [
      "/images/collections/gifting/festive-hampers/festive-hamper-main.jpg",
      "/images/collections/gifting/festive-hampers/festive-hamper-contents-open.jpg"
    ],
    colors: ["Royal Festive Red", "Classic Golden Kraft"],
    sizes: ["Standard Hamper", "Deluxe Artisan Hamper"]
  },
  {
    id: "product-006",
    slug: "artisan-mini-gift-box",
    name: "Artisan Mini Gift Box — A Little Thank You",
    category: "Gifting",
    subcategory: "Mini Gift Sets",
    price: 599,
    originalPrice: 750,
    shortDescription: "A compact, heartfelt gift box with a handwritten gratitude note.",
    description: "A compact, heartfelt gift box with hand-poured soy wax votive candle, herbal tea sachet, and a handwritten gratitude card made from seeded paper that grows into tulsi.",
    sku: "SW-GF-006",
    stock: 25,
    featuredRank: 10,
    image: "/images/collections/gifting/thank-you-boxes/thank-you-box-closed.jpg",
    images: [
      "/images/collections/gifting/thank-you-boxes/thank-you-box-closed.jpg",
      "/images/collections/gifting/thank-you-boxes/thank-you-box-inside.jpg"
    ],
    colors: ["Lavender Blush", "Kraft Earth"],
    sizes: ["Compact Gift Box"]
  },

  // ==========================================
  // 4. COLLECTIONS (Bags & Special Crafts)
  // ==========================================
  {
    id: "product-014",
    slug: "natural-handmade-jute-tote-bag",
    name: "Natural Handmade Jute Tote & Pouch Duo",
    category: "Collections",
    subcategory: "Jute & Cotton Bags",
    price: 749,
    originalPrice: 999,
    badge: "Bestseller",
    shortDescription: "Sturdy eco-friendly golden jute carry bag with zip accessory pouch.",
    description: "Crafted by rural women artisans from Sangli. Stitched with reinforced handles, water-resistant inner lining, and natural coconut button accents. Ideal for market runs or everyday work.",
    sku: "SW-CL-014",
    stock: 40,
    featuredRank: 11,
    image: "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg",
    images: [
      "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg",
      "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-pouch.jpg"
    ],
    colors: ["Golden Natural", "Indigo Blue", "Charcoal Black"],
    sizes: ["Standard Tote (16x14x6 inch)", "Large Market Tote (19x16x7 inch)"],
    sizePrices: {
      "Standard Tote (16x14x6 inch)": 599,
      "Large Market Tote (19x16x7 inch)": 799
    },
    variants: [
      {
        name: "Golden Natural",
        hex: "#c29958",
        images: [
          "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg",
          "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-pouch.jpg"
        ]
      },
      {
        name: "Indigo Blue",
        hex: "#295f98",
        images: [
          "/images/collections/collections/jute-cotton-bags/indigo-blue/indigo-blue-front.jpg",
          "/images/collections/collections/jute-cotton-bags/indigo-blue/indigo-blue-handle.jpg"
        ]
      },
      {
        name: "Charcoal Black",
        hex: "#262626",
        images: [
          "/images/collections/collections/jute-cotton-bags/charcoal-black-tote-front.jpg",
          "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-pouch.jpg"
        ]
      }
    ]
  },
  {
    id: "product-008",
    slug: "slow-morning-collection",
    name: "Slow Morning Ceramic Mug & Coaster Set",
    category: "Collections",
    subcategory: "Morning Rituals",
    price: 899,
    originalPrice: 1199,
    badge: "New",
    shortDescription: "A pair of studio pottery coffee mugs with hand-carved wooden coasters.",
    description: "Bring a little ceremony to the first cup of chai or filter coffee. Wheel-thrown stoneware mugs with satisfying weight, accompanied by Sheesham wood coasters.",
    sku: "SW-CO-008",
    stock: 16,
    featuredRank: 12,
    image: "/images/collections/collections/morning-rituals-mugs/stoneware-mug-front.jpg",
    images: [
      "/images/collections/collections/morning-rituals-mugs/stoneware-mug-front.jpg",
      "/images/collections/collections/morning-rituals-mugs/stoneware-mug-coaster-closeup.jpg"
    ],
    colors: ["Speckled Oatmeal Studio Mug"],
    sizes: ["Set of 2 Mugs (320ml)"]
  }
];

export const categories = [
  {
    slug: "food-ngo",
    name: "Food & NGO Products",
    description: "Authentic homemade delicacies & pantry essentials prepared by rural women self-help groups.",
    image: "/images/collections/food-ngo/traditional-pickles/mango/mango-pickle-jar-authentic.jpg",
    count: products.filter((p) => p.category === "Food & NGO Products").length,
    subcategories: ["Traditional Pickles", "Nutritious Sweets", "Handmade Papads", "Spices & Masala"],
    gstRate: 5,
    hsnCode: "2106",
  },
  {
    slug: "home-living",
    name: "Home & Living",
    description: "Hand-molded pottery, brass accents, and handwoven linens for thoughtful living spaces.",
    image: "/images/collections/home-living/decor-pottery/terracotta-vase-front.jpg",
    count: products.filter((p) => p.category === "Home & Living").length,
    subcategories: ["Decor & Pottery", "Kitchen & Dining", "Table Linen"],
    gstRate: 12,
    hsnCode: "6912",
  },
  {
    slug: "gifting",
    name: "Gifting",
    description: "Curated hampers, festive gift boxes, and meaningful artisanal keepsakes.",
    image: "/images/collections/gifting/festive-hampers/festive-hamper-main.jpg",
    count: products.filter((p) => p.category === "Gifting").length,
    subcategories: ["Festive Hampers", "Mini Gift Sets"],
    gstRate: 12,
    hsnCode: "9602",
  },
  {
    slug: "collections",
    name: "Collections",
    description: "Handmade jute tote bags, morning coffee mugs, and thoughtful accessories.",
    image: "/images/collections/collections/jute-cotton-bags/golden-natural/golden-jute-front.jpg",
    count: products.filter((p) => p.category === "Collections").length,
    subcategories: ["Jute & Cotton Bags", "Morning Rituals"],
    gstRate: 5,
    hsnCode: "6305",
  },
];

export function getProductGst(product: Product, categoryGstMap?: Record<string, number>): { rate: number; hsn: string } {
  if (typeof product.gstRate === "number") {
    return { rate: product.gstRate, hsn: product.hsnCode || "9999" };
  }
  const catName = (product.category || "").toLowerCase();
  if (categoryGstMap && categoryGstMap[product.category] !== undefined) {
    return { rate: categoryGstMap[product.category], hsn: product.hsnCode || "9999" };
  }
  if (catName.includes("food") || catName.includes("sweet") || catName.includes("pickle")) {
    return { rate: 5, hsn: product.hsnCode || "2106" };
  }
  if (catName.includes("bag") || catName.includes("jute") || catName.includes("cotton")) {
    return { rate: 5, hsn: product.hsnCode || "6305" };
  }
  if (catName.includes("home") || catName.includes("pottery") || catName.includes("ceramic")) {
    return { rate: 12, hsn: product.hsnCode || "6912" };
  }
  return { rate: 12, hsn: product.hsnCode || "9602" };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
