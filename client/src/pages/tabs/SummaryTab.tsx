import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, DollarSign, Calendar, Database, Shield, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCurrency } from '@/components/AnimatedCounter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FAIRData {
  scenario: any;
  annualizedLossExpectancy: any;
  lossMagnitude: any;
  lossEventFrequency: any;
  threatEventFrequency: any;
  susceptibility: any;
  riskTreatment: any;
}

interface MetricDetail {
  title: string;
  description: string;
  calculation: string;
  interpretation: string;
  implications: string;
}

export default function SummaryTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const metricDetails: Record<string, MetricDetail> = {
    ale: {
      title: "Annualized Loss Expectancy (ALE)",
      description: "The expected monetary loss from this risk scenario over the course of one year.",
      calculation: `ALE = Loss Event Frequency × Loss Magnitude\n\n${data.lossEventFrequency.mostLikely.toFixed(2)} events/year × ${formatCurrency(data.lossMagnitude.total.mostLikely)} per event = ${formatCurrency(data.annualizedLossExpectancy.mostLikely)}/year`,
      interpretation: `The most likely ALE of ${formatCurrency(data.annualizedLossExpectancy.mostLikely)} means Hyperion should expect to lose approximately $2 billion annually from Iron Vortex ransomware attacks. The range (${formatCurrency(data.annualizedLossExpectancy.min)} - ${formatCurrency(data.annualizedLossExpectancy.max)}) reflects uncertainty in both frequency and magnitude estimates.`,
      implications: "This ALE represents 84% of Hyperion's annual revenue ($2.4B), making it an existential threat. Even the minimum estimate ($610M) would severely impact the organization's financial viability. This level of risk demands immediate board-level attention and cannot be accepted without treatment."
    },
    sle: {
      title: "Single Loss Expectancy (SLE)",
      description: "The expected monetary loss from a single successful ransomware attack.",
      calculation: `SLE = Primary Loss + Secondary Loss\n\n${formatCurrency(data.lossMagnitude.primary.mostLikely)} + ${formatCurrency(data.lossMagnitude.secondary.mostLikely)} = ${formatCurrency(data.lossMagnitude.total.mostLikely)}`,
      interpretation: `Each successful Iron Vortex attack would cost Hyperion approximately ${formatCurrency(data.lossMagnitude.total.mostLikely)}. This includes immediate costs (Year 1: regulatory fines, customer churn, incident response) and extended impacts (Years 2-3: long-term reputation damage, security improvements, insurance increases).`,
      implications: "A single breach would cost 73% of annual revenue. The genomic data sensitivity amplifies impact - customers cannot change their DNA, making breaches unrecoverable and customer churn permanent. This is 3-4× higher than typical healthcare breaches due to multi-jurisdictional regulatory exposure (HIPAA, GDPR, LGPD)."
    },
    lef: {
      title: "Loss Event Frequency (LEF)",
      description: "The expected number of successful ransomware attacks per year.",
      calculation: `LEF = Threat Event Frequency × Vulnerability\n\n${data.threatEventFrequency.mostLikely.toFixed(2)} attempts/year × ${(data.susceptibility.mostLikely * 100).toFixed(0)}% success rate = ${data.lossEventFrequency.mostLikely.toFixed(2)} events/year`,
      interpretation: `Hyperion faces approximately ${data.lossEventFrequency.mostLikely.toFixed(1)} successful breach per year. This translates to a 96% probability of at least one successful attack within the next 12 months. The range (${data.lossEventFrequency.min.toFixed(2)} - ${data.lossEventFrequency.max.toFixed(1)}) reflects uncertainty in both threat frequency and defensive effectiveness.`,
      implications: "A breach is not a matter of 'if' but 'when'. With near-certainty of occurrence within 12 months, reactive incident response planning is insufficient. Proactive risk treatment to reduce either TEF (threat deterrence) or Vulnerability (control strengthening) is critical."
    },
    records: {
      title: "Records at Risk",
      description: "The number of individual genomic records that could be compromised in a successful attack.",
      calculation: `Total records across all AWS regions: ${data.scenario.recordsAtRisk.toLocaleString()} genomic records\n\nDistribution: ${data.scenario.regions} AWS regions\nData volume: ${data.scenario.dataVolume}`,
      interpretation: `Hyperion's HeliosAI platform contains ${(data.scenario.recordsAtRisk / 1e6).toFixed(0)} million genomic records. Each record includes: whole genome sequence (WGS), clinical annotations, family history, and phenotypic data. This represents one of the largest concentrations of genomic data globally.`,
      implications: "Genomic data is uniquely sensitive - it's permanent (cannot be changed like passwords), heritable (affects family members), and predictive (reveals future health risks). A breach would expose not just current customers but their relatives and descendants. This drives the exceptionally high customer churn ($350M primary, $240M secondary) and regulatory fine estimates ($870M)."
    },
    timeHorizon: {
      title: "Analysis Time Horizon",
      description: "The time period over which this risk analysis applies.",
      calculation: `Analysis period: ${data.scenario.timeframe}\nAnalysis date: ${data.scenario.analysisDate}\n\nPrimary losses: Year 1\nSecondary losses: Years 2-3`,
      interpretation: `This analysis quantifies risk over a 12-month forward-looking period. Primary losses (${formatCurrency(data.lossMagnitude.primary.mostLikely)}) occur within the fiscal year of the breach. Secondary losses (${formatCurrency(data.lossMagnitude.secondary.mostLikely)}) extend into years 2-3 as long-term impacts materialize.`,
      implications: "The 12-month horizon is standard for annual risk assessments and budget planning. However, the actual impact of a genomic data breach extends far beyond 3 years - reputation damage and customer trust erosion can persist for 5-10 years. The analysis conservatively captures only the first 3 years of impact."
    },
    riskReduction: {
      title: "Risk Reduction Potential",
      description: "The amount of risk that can be eliminated through the proposed risk treatment program.",
      calculation: `Current ALE: ${formatCurrency(data.annualizedLossExpectancy.mostLikely)}\nTreatment investment: ${formatCurrency(data.riskTreatment.totalProgram.investment)}\nResidual ALE: ${formatCurrency(data.annualizedLossExpectancy.mostLikely - data.riskTreatment.totalProgram.aleReduction)}\n\nRisk reduction: ${formatCurrency(data.riskTreatment.totalProgram.aleReduction)} (${((data.riskTreatment.totalProgram.aleReduction / data.annualizedLossExpectancy.mostLikely) * 100).toFixed(0)}%)`,
      interpretation: `A ${formatCurrency(data.riskTreatment.totalProgram.investment)} investment in immediate and short-term controls can reduce ALE by ${formatCurrency(data.riskTreatment.totalProgram.aleReduction)} annually. This represents a ${data.riskTreatment.totalProgram.roi}× return on investment - every dollar spent on controls saves $${data.riskTreatment.totalProgram.roi} in expected losses.`,
      implications: "The extraordinary ROI (${data.riskTreatment.totalProgram.roi}×) reflects the current high-risk state. Immediate actions ($${formatCurrency(data.riskTreatment.immediate.investment)}) include: phishing-resistant MFA for privileged accounts, enhanced security awareness training with vishing simulations, tightened cross-region IAM policies, and restricted TestSure vendor access. These high-leverage controls address the most critical vulnerabilities identified in the susceptibility analysis."
    }
  };

  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(metricDetails[metricKey]);
    setDialogOpen(true);
  };

  const MetricCard = ({
    id,
    icon: Icon,
    title,
    value,
    subtext,
    badge,
    colorClass = "risk-critical",
    delay = 0
  }: {
    id: string;
    icon: any;
    title: string;
    value: React.ReactNode;
    subtext: string;
    badge: React.ReactNode;
    colorClass?: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      onClick={() => handleMetricClick(id)}
      className="cursor-pointer"
    >
      <Card className="glass-effect relative transition-smooth hover:shadow-lg">
        <div className="absolute top-4 right-4">
          <Info className="h-4 w-4 opacity-50 hover:opacity-100 transition-smooth" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="metric-label flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`metric-value ${colorClass}`}>
            {value}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {subtext}
          </p>
          {badge}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Risk Level Banner */}
      <Card className="border-2 border-red-500/50 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">CRITICAL RISK - EXISTENTIAL THREAT</CardTitle>
              <CardDescription className="text-base mt-1">
                Immediate executive attention and board-level action required • Click any metric for details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            The risk of an Iron Vortex ransomware attack on Hyperion Genomics represents a <strong>critical, existential threat</strong> with an estimated annualized loss expectancy of <strong className="text-red-600 dark:text-red-400">{formatCurrency(data.annualizedLossExpectancy.mostLikely)}</strong> and a <strong>96% probability of occurrence within the next 12 months</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          id="ale"
          icon={DollarSign}
          title="Annualized Loss Expectancy"
          value={<AnimatedCurrency value={data.annualizedLossExpectancy.mostLikely} duration={2.5} />}
          subtext={`Range: ${formatCurrency(data.annualizedLossExpectancy.min)} - ${formatCurrency(data.annualizedLossExpectancy.max)}`}
          badge={<Badge variant="destructive" className="mt-3">Per Year</Badge>}
          colorClass="risk-critical"
          delay={0.1}
        />

        <MetricCard
          id="sle"
          icon={TrendingDown}
          title="Single Loss Expectancy"
          value={<AnimatedCurrency value={data.lossMagnitude.total.mostLikely} duration={2.5} />}
          subtext={`Range: ${formatCurrency(data.lossMagnitude.total.min)} - ${formatCurrency(data.lossMagnitude.total.max)}`}
          badge={<Badge variant="outline" className="mt-3">Per Event</Badge>}
          colorClass="risk-high"
          delay={0.2}
        />

        <MetricCard
          id="lef"
          icon={AlertTriangle}
          title="Loss Event Frequency"
          value={data.lossEventFrequency.mostLikely.toFixed(1)}
          subtext={`Range: ${data.lossEventFrequency.min.toFixed(2)} - ${data.lossEventFrequency.max.toFixed(1)} events/year`}
          badge={<Badge variant="secondary" className="mt-3">~1 attack per year</Badge>}
          colorClass="text-orange-600 dark:text-orange-400"
          delay={0.3}
        />

        <MetricCard
          id="records"
          icon={Database}
          title="Records at Risk"
          value={`${(data.scenario.recordsAtRisk / 1e6).toFixed(0)}M`}
          subtext="Individual genomic records"
          badge={<Badge variant="outline" className="mt-3">{data.scenario.regions} AWS Regions</Badge>}
          colorClass=""
          delay={0.4}
        />

        <MetricCard
          id="timeHorizon"
          icon={Calendar}
          title="Time Horizon"
          value={data.scenario.timeframe}
          subtext="Analysis period"
          badge={<Badge variant="outline" className="mt-3">{data.scenario.analysisDate}</Badge>}
          colorClass=""
          delay={0.5}
        />

        <MetricCard
          id="riskReduction"
          icon={Shield}
          title="Risk Reduction Potential"
          value={<AnimatedCurrency value={data.riskTreatment.totalProgram.aleReduction} duration={2.5} />}
          subtext={`With ${formatCurrency(data.riskTreatment.totalProgram.investment)} investment`}
          badge={<Badge variant="default" className="mt-3">{data.riskTreatment.totalProgram.roi}× ROI</Badge>}
          colorClass="text-green-600 dark:text-green-400"
          delay={0.6}
        />
      </div>

      {/* Scenario Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Scenario</CardTitle>
          <CardDescription>Threat actor, asset, and attack methodology</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Threat Actor</h4>
              <p className="text-sm text-muted-foreground">{data.scenario.threatActor}</p>
              <p className="text-sm mt-2">
                Russian cybercriminal ransomware group with demonstrated capability against genetic testing companies. Successfully breached two similar organizations in the past 6 months.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Asset at Risk</h4>
              <p className="text-sm text-muted-foreground">{data.scenario.asset}</p>
              <p className="text-sm mt-2">
                {data.scenario.recordsAtRisk.toLocaleString()} genomic records across {data.scenario.regions} AWS regions. {data.scenario.dataVolume} of sensitive health and genetic data.
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Attack Methodology</h4>
            <p className="text-sm">
              Multi-stage attack: (1) Spear-phishing of privileged users; (2) Credential theft and MFA bypass; (3) AWS privilege escalation; (4) Lateral movement across regions; (5) Data exfiltration; (6) Cyclone ransomware deployment with intermittent encryption for stealth.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Key Findings</CardTitle>
          <CardDescription>Critical insights from the FAIR analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <div>
                <p className="font-medium">High Likelihood</p>
                <p className="text-sm text-muted-foreground">~1 successful attack per year (96% annual probability)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <div>
                <p className="font-medium">Catastrophic Impact</p>
                <p className="text-sm text-muted-foreground">$1-3B loss per event threatens organizational viability</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
              </div>
              <div>
                <p className="font-medium">Multi-Jurisdictional Regulatory Exposure</p>
                <p className="text-sm text-muted-foreground">HIPAA, GDPR, LGPD penalties estimated at $536M-$1.3B</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
              </div>
              <div>
                <p className="font-medium">Genomic Data Sensitivity</p>
                <p className="text-sm text-muted-foreground">Breach impact significantly higher than credit/PII due to genetic data permanence</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
              </div>
              <div>
                <p className="font-medium">Control Gaps Identified</p>
                <p className="text-sm text-muted-foreground">Outdated security awareness, legacy MFA, IAM over-permissiveness, third-party risk</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div>
                <p className="font-medium">High ROI Risk Treatment Available</p>
                <p className="text-sm text-muted-foreground">$1.1M immediate investment yields $500-670M annual risk reduction (450-600% ROI)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Summary */}
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-green-600 dark:text-green-400">Immediate Action Required</CardTitle>
          <CardDescription>Priority risk treatment recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Immediate Actions (0-3 months) - {formatCurrency(data.riskTreatment.immediate.investment)}</h4>
              <ul className="space-y-2 text-sm">
                {data.riskTreatment.immediate.actions.map((action: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium mt-3 text-green-600 dark:text-green-400">
                Expected ALE Reduction: {formatCurrency(data.riskTreatment.immediate.aleReduction)} ({data.riskTreatment.immediate.roi}× ROI)
              </p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">
                <strong>Risk Acceptance Decision:</strong> Given the existential nature of this risk, risk acceptance is not recommended. The organization should immediately initiate the risk treatment program to reduce susceptibility and loss magnitude to tolerable levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedMetric && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedMetric.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedMetric.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Calculation</h4>
                  <div className="bg-muted p-4 rounded font-mono text-sm whitespace-pre-line">
                    {selectedMetric.calculation}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Interpretation</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedMetric.interpretation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Business Implications</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedMetric.implications}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
