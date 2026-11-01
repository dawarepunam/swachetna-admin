import { NextResponse } from "next/server";
import { fetchStrapiAdminWorkspace, updateStrapiAdminWorkspace } from "../../../../lib/strapi";
import seededWorkspace from "../../../../data/seededWorkspace.json";

export async function GET() {
  try {
    const liveData = await fetchStrapiAdminWorkspace();
    if (liveData && Array.isArray(liveData.products) && liveData.products.length > 0) {
      return NextResponse.json({ data: liveData });
    }
    // Fallback to seeded workspace directly from Localhost SQLite database
    return NextResponse.json({ data: seededWorkspace });
  } catch (err: any) {
    return NextResponse.json({ data: seededWorkspace });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Sanitize body to strip any stale component internal `id` fields
    // Strapi throws 400 "Some of the provided components are not related to the entity"
    // if an `id` is provided that does not match the current repeatable component row in the DB.
    const cleanData: Record<string, any> = {};

    if (Array.isArray(body.products)) {
      cleanData.products = body.products.map(({ id, ...rest }: any) => {
        const prodItem: Record<string, any> = {
          name: String(rest.name || "").trim(),
          slug: String(rest.slug || "").trim(),
          sku: String(rest.sku || "").trim(),
          price: Number(rest.price) || 0,
          stock: Number(rest.stock) || 0,
          category: String(rest.category || "").trim(),
          subcategory: rest.subcategory ? String(rest.subcategory).trim() : "",
          description: rest.description ? String(rest.description).trim() : "",
          status: rest.status === "Draft" ? "Draft" : "Published",
          image: rest.image ? String(rest.image) : "",
          images: Array.isArray(rest.images) ? rest.images.join(", ") : (rest.images || ""),
          colors: Array.isArray(rest.colors) ? rest.colors.join(", ") : (rest.colors || ""),
          sizes: Array.isArray(rest.sizes) ? rest.sizes.join(", ") : (rest.sizes || ""),
          variants: Array.isArray(rest.variants) ? rest.variants : [],
          reviews: Array.isArray(rest.reviews) ? rest.reviews : [],
        };
        if (rest.originalPrice !== undefined && rest.originalPrice !== null && rest.originalPrice !== "") {
          prodItem.originalPrice = Number(rest.originalPrice);
        }
        return prodItem;
      });
    }

    if (Array.isArray(body.categories)) {
      cleanData.categories = body.categories.map(({ id, count, image, ...rest }: any) => ({
        name: String(rest.name || "").trim(),
        slug: String(rest.slug || "").trim(),
        description: rest.description ? String(rest.description).trim() : "",
        subcategories: Array.isArray(rest.subcategories) ? rest.subcategories.join(", ") : (rest.subcategories || ""),
      }));
    }

    if (Array.isArray(body.campaigns)) {
      cleanData.campaigns = body.campaigns.map(({ id, ...rest }: any) => ({
        name: String(rest.name || "").trim(),
        area: String(rest.area || "").trim(),
        description: rest.description ? String(rest.description).trim() : "",
        status: rest.status === "Draft" ? "Draft" : "Active",
      }));
    }

    if (body.content) {
      const { id, ...restContent } = body.content;
      cleanData.content = {
        title: String(restContent.title || "").trim(),
        description: String(restContent.description || "").trim(),
      };
    }

    if (body.settings) {
      const { id, ...restSettings } = body.settings;
      const sett: Record<string, any> = {
        organization: String(restSettings.organization || "Swachetna Foundation").trim(),
        phone: String(restSettings.phone || "").trim(),
        website: String(restSettings.website || "").trim(),
        address: String(restSettings.address || "").trim(),
      };
      if (restSettings.email && restSettings.email.includes("@")) {
        sett.email = restSettings.email.trim();
      }
      cleanData.settings = sett;
    }

    if (Array.isArray(body.orders)) {
      cleanData.orders = body.orders.map(({ id, ...rest }: any) => {
        const ord: Record<string, any> = {
          orderId: String(rest.orderId || rest.id || `ORD-${Date.now()}`),
          customer: String(rest.customer || "Customer"),
          total: Number(rest.total) || 0,
          status: ["Pending", "Processing", "Shipped", "Delivered"].includes(rest.status) ? rest.status : "Pending",
          paymentMethod: String(rest.paymentMethod || "UPI"),
          items: Array.isArray(rest.items) ? rest.items : [],
          orderDate: rest.createdAt || rest.orderDate || new Date().toISOString(),
        };
        if (rest.customerEmail && rest.customerEmail.includes("@")) {
          ord.customerEmail = rest.customerEmail.trim();
        }
        if (rest.customerPhone) {
          ord.customerPhone = String(rest.customerPhone).trim();
        }
        if (rest.customerAddress) {
          ord.customerAddress = String(rest.customerAddress).trim();
        }
        return ord;
      });
    }

    if (Array.isArray(body.inquiries)) {
      cleanData.inquiries = body.inquiries.map(({ id, ...rest }: any) => {
        const inq: Record<string, any> = {
          name: String(rest.name || "Anonymous").trim(),
          message: String(rest.message || "").trim(),
          status: ["New", "Read", "Responded"].includes(rest.status) ? rest.status : "New",
          createdAt: rest.createdAt || new Date().toISOString(),
          subject: rest.subject ? String(rest.subject).trim() : "General Inquiry",
        };
        if (rest.email && rest.email.includes("@")) {
          inq.email = rest.email.trim();
        }
        if (rest.phone) {
          inq.phone = String(rest.phone).trim();
        }
        return inq;
      });
    }

    if (Array.isArray(body.coupons)) {
      cleanData.coupons = body.coupons.map(({ id, ...rest }: any) => ({
        code: String(rest.code || "").trim().toUpperCase(),
        discountType: rest.discountType === "fixed" ? "fixed" : "percentage",
        discountValue: Number(rest.discountValue) || 0,
        minOrderAmount: Number(rest.minOrderAmount) || 0,
        maxDiscount: rest.maxDiscount ? Number(rest.maxDiscount) : undefined,
        status: rest.status === "Inactive" ? "Inactive" : "Active",
        description: rest.description ? String(rest.description).trim() : "",
      }));
    }

    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    const res = await fetch(`${STRAPI_BASE_URL}/api/admin`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: cleanData }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PUT to Strapi failed:", res.status, errText);
      return NextResponse.json({ error: "Failed to update Strapi", status: res.status, details: errText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

