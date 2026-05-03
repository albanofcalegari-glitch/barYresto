import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireCurrentRestaurant } from "@/lib/tenant";
import { uploadImage, isConfigured } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isConfigured) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado. Usá URLs directas por ahora." },
      { status: 501 },
    );
  }

  const { restaurant } = await requireCurrentRestaurant();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usá JPG, PNG o WebP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "La imagen no puede superar 5 MB." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const folder = `baryresto/${restaurant.slug}`;

  const { url, publicId } = await uploadImage(buffer, folder);

  return NextResponse.json({ url, publicId });
}
