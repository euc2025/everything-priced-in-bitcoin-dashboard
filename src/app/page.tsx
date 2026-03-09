import { BitcoinHeader } from "@/components/BitcoinHeader";
import { DisclaimerFooter } from "@/components/DisclaimerFooter";
import { EducationSection } from "@/components/EducationSection";
import { FinancialAssetsSection } from "@/components/FinancialAssetsSection";
import { StaticAssetsSection } from "@/components/StaticAssetsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <BitcoinHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="space-y-10">
          <StaticAssetsSection />
          <FinancialAssetsSection />
          <EducationSection />
        </div>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
