import HeroSection from "@/components/dashboard/HeroSection"
import FeatureSection from "@/components/dashboard/FeatureSection"
export function DashboardPage() {
  return (
    <div className="space-y-10">

      <HeroSection />
      <FeatureSection />
    </div>
  )
}