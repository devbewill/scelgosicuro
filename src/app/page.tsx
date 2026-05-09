import { getSectors } from "@/lib/data/catalog"
import { LandingPage } from "@/components/landing/landing-page"

export default async function Home() {
  const sectors = await getSectors()
  return <LandingPage sectors={sectors} />
}
