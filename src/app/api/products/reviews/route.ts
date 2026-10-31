import { NextResponse } from "next/server";
import { fetchStrapiAdminWorkspace, updateStrapiAdminWorkspace } from "../../../../lib/strapi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productSlug, author, rating, comment } = body;

    if (!productSlug || !author || !rating || !comment) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      author: String(author).trim(),
      rating: Number(rating),
      comment: String(comment).trim(),
      date: new Date().toISOString().split("T")[0],
      verified: true,
    };

    // 1. Fetch current workspace from Strapi
    const workspace = await fetchStrapiAdminWorkspace();
    if (workspace && Array.isArray(workspace.products)) {
      const updatedProducts = workspace.products.map(({ id: _id, ...p }: any) => {
        if (p.slug === productSlug) {
          const existingReviews = Array.isArray(p.reviews) ? p.reviews : [];
          return {
            ...p,
            reviews: [newReview, ...existingReviews],
          };
        }
        return p;
      });

      // Update Strapi
      await updateStrapiAdminWorkspace({ products: updatedProducts });
    }

    return NextResponse.json({ success: true, review: newReview });
  } catch (err: any) {
    console.error("Error submitting review:", err);
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}
