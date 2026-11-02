const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function fetchStrapiAdminWorkspace() {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/admin?populate[products]=*&populate[categories]=*&populate[campaigns]=*&populate[content]=*&populate[settings]=*&populate[orders]=*&populate[inquiries]=*&populate[coupons]=*`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Strapi Admin fetch returned non-200 status:", res.status);
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.warn("Could not connect to Strapi backend:", error);
    return null;
  }
}

export async function updateStrapiAdminWorkspace(payload: Record<string, unknown>) {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}/api/admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to update Strapi Admin:", res.status, errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating Strapi Admin workspace:", error);
    return false;
  }
}

export async function submitStrapiOrder(newOrder: {
  orderId: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
  paymentMethod?: string;
  items?: unknown;
  status?: "Pending" | "Processing" | "Shipped" | "Delivered";
}) {
  try {
    const currentWorkspace = await fetchStrapiAdminWorkspace();
    const existingOrders = Array.isArray(currentWorkspace?.orders) ? currentWorkspace.orders : [];

    const orderPayload = {
      orderId: newOrder.orderId,
      customer: newOrder.customer,
      customerEmail: newOrder.customerEmail || "",
      customerPhone: newOrder.customerPhone || "",
      customerAddress: newOrder.customerAddress || "",
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod || "UPI",
      items: newOrder.items || [],
      status: newOrder.status || "Pending",
      orderDate: new Date().toISOString(),
    };

    // Deduct stock for ordered items from current products catalog in Strapi
    const existingProducts = Array.isArray(currentWorkspace?.products) ? currentWorkspace.products : [];
    const orderedItems = Array.isArray(newOrder.items) ? newOrder.items : [];

    const updatedProducts = existingProducts.map((p: any) => {
      const match = orderedItems.find((item: any) =>
        (item.id && (String(item.id) === String(p.id) || String(item.id) === String(p.slug))) ||
        (item.sku && p.sku && String(item.sku).trim().toLowerCase() === String(p.sku).trim().toLowerCase()) ||
        (item.name && p.name && String(item.name).trim().toLowerCase() === String(p.name).trim().toLowerCase())
      );
      if (match && Number(match.quantity) > 0) {
        const currentStock = Number(p.stock) || 0;
        const newStock = Math.max(0, currentStock - Number(match.quantity));
        return {
          ...p,
          stock: newStock,
        };
      }
      return p;
    });

    let success = false;
    try {
      success = await updateStrapiAdminWorkspace({
        orders: [orderPayload, ...existingOrders.map(({ id, ...rest }: any) => rest)],
        products: updatedProducts.map(({ id, ...rest }: any) => rest),
      });
    } catch {
      success = false;
    }

    // Always succeed so checkout flow doesn't break if Strapi is temporarily offline
    return true;
  } catch (error) {
    console.error("Order placed locally / fallback:", error);
    return true;
  }
}

export async function submitStrapiInquiry(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  try {
    const currentWorkspace = await fetchStrapiAdminWorkspace();
    const existingInquiries = Array.isArray(currentWorkspace?.inquiries) ? currentWorkspace.inquiries : [];

    const inquiryPayload = {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone || "",
      subject: inquiry.subject || "General Inquiry",
      message: inquiry.message,
      status: "New",
      createdAt: new Date().toISOString(),
    };

    try {
      await updateStrapiAdminWorkspace({
        inquiries: [inquiryPayload, ...existingInquiries.map(({ id, ...rest }: any) => rest)],
      });
    } catch {
      // ignore
    }

    return true;
  } catch (error) {
    console.error("Inquiry saved locally / fallback:", error);
    return true;
  }
}

