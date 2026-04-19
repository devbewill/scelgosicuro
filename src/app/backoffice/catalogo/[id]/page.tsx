import { notFound } from "next/navigation"
import { getBackofficeProductDetail } from "@/lib/data/backoffice"
import { ProductDetailClient } from "./client"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getBackofficeProductDetail(Number(id))
  if (!product) notFound()
  return <ProductDetailClient product={product} />
}
