import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles: File[] = [];
    if (files && files.length > 0) {
      allFiles.push(...files);
    } else if (singleFile) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      if (typeof file === "string" || !file.name) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // File name sanitization
      const ext = path.extname(file.name) || ".jpg";
      const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      const uniqueFileName = `${baseName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${uniqueFileName}`);
    }

    if (uploadedUrls.length === 1) {
      return NextResponse.json({ url: uploadedUrls[0], urls: uploadedUrls, success: true });
    }

    return NextResponse.json({ urls: uploadedUrls, url: uploadedUrls[0], success: true });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}

