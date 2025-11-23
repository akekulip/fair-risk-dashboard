import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, ExternalLink, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { AnimatedCurrency } from '@/components/AnimatedCounter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FAIRData {
  lossMagnitude: any;
}

interface ExternalData {
  sources: any[];
  industryBenchmarks: any;
}

interface ComponentDetail {
  title: string;
  amount: string;
  description: string;
  calculation: string;
  rationale: string;
  benchmark: string;
}

export default function LossMagnitudeTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [externalData, setExternalData] = useState<ExternalData | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/fair-data.json').then(res => res.json()),
      fetch('/external-data.json').then(res => res.json())
    ]).then(([fairData, extData]) => {
      setData(fairData);
      setExternalData(extData);
    }).catch(console.error);
  }, []);

  if (!data || !externalData || !data.lossMagnitude) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const loss = data.lossMagnitude;

  // Add safety checks for nested properties
  if (!loss.primary?.components || !loss.secondary?.components) {
    return <div className="flex items-center justify-center h-96">Loading data structure...</div>;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const componentDetails: Record<string, ComponentDetail> = {
    productivity: {
      title: "Productivity Loss",
      amount: formatCurrency(loss.primary.components.productivity?.mostLikely || 0),
      description: "Lost employee productivity during incident response and recovery",
      calculation: `${(loss.primary.components.productivity?.min || 0) / 1e6}-${(loss.primary.components.productivity?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.productivity?.mostLikely || 0) / 1e6}M`,
      rationale: "During a ransomware attack, IT teams, security personnel, legal counsel, and executive leadership are fully engaged in incident response. Business operations are disrupted as systems are taken offline for forensic analysis. Customer-facing teams handle inquiries and complaints. Based on Hyperion's workforce of ~2,400 employees (estimated from $2.4B revenue), approximately 40% (960 employees) are materially impacted for an average of 6-8 weeks at an average fully-loaded cost of $150K/year.",
      benchmark: "IBM Cost of Breach 2024: Productivity loss averages 18-22% of total breach cost for healthcare organizations. Verizon DBIR 2024: Ransomware incidents average 21 days to full recovery."
    },
    response: {
      title: "Response Costs",
      amount: formatCurrency(loss.primary.components.response?.mostLikely || 0),
      description: "Direct costs of incident response, forensics, and remediation",
      calculation: `${(loss.primary.components.response?.min || 0) / 1e6}-${(loss.primary.components.response?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.response?.mostLikely || 0) / 1e6}M`,
      rationale: "Includes: external cybersecurity consultants ($3-5M for forensics and remediation), legal counsel ($2-3M for breach notification and regulatory response), crisis communications/PR ($1-2M), credit monitoring for affected individuals ($3-5M for 130M records), customer notification costs ($1M for multi-jurisdictional notifications), and ransom payment consideration (Iron Vortex typically demands $5-15M, though payment is not recommended).",
      benchmark: "IBM Cost of Breach 2024: Detection and escalation costs average $1.58M, notification costs $0.27M per breach. Ponemon Institute: External consultant costs for major breaches range $5-15M."
    },
    replacement: {
      title: "Replacement Costs",
      amount: formatCurrency(loss.primary.components.replacement?.mostLikely || 0),
      description: "Cost to replace compromised systems, data, and infrastructure",
      calculation: `${(loss.primary.components.replacement?.min || 0) / 1e6}-${(loss.primary.components.replacement?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.replacement?.mostLikely || 0) / 1e6}M`,
      rationale: "Compromised AWS infrastructure must be rebuilt from clean backups or new instances. All privileged account credentials must be rotated. Potentially compromised application code must be reviewed and redeployed. Hardware security modules (HSMs) and encryption keys may need replacement. Customer-facing applications require extensive testing before restoration. Estimated: 30% of AWS infrastructure ($50M annual cloud spend × 30% = $15M replacement cost).",
      benchmark: "Verizon DBIR 2024: Asset replacement costs for ransomware average 12-18% of total incident cost. Gartner: Cloud infrastructure replacement following compromise averages $10-20M for enterprise-scale deployments."
    },
    finesJudgments: {
      title: "Fines & Judgments",
      amount: formatCurrency(loss.primary.components.finesJudgments?.mostLikely || 0),
      description: "Regulatory fines and legal settlements across multiple jurisdictions",
      calculation: `${(loss.primary.components.finesJudgments?.min || 0) / 1e6}-${(loss.primary.components.finesJudgments?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.finesJudgments?.mostLikely || 0) / 1e6}M`,
      rationale: "Multi-jurisdictional exposure: HIPAA (US): $200-400M based on 130M records × $1,500-3,000 per record for willful neglect. GDPR (EU): €300-600M (4% of global revenue) for inadequate security controls. LGPD (Brazil): $70-130M for genetic data breach. Class action settlements: $100-200M based on similar genomic data breaches. Total regulatory + civil liability: $670-1,330M, most likely $870M.",
      benchmark: "External Source: Anthem HIPAA settlement (2015): $16M for 79M records. Equifax settlement (2019): $575M for 147M records. GDPR fines: Amazon €746M (2021), Meta €1.2B (2023)."
    },
    competitiveAdvantage: {
      title: "Competitive Advantage Loss",
      amount: formatCurrency(loss.primary.components.competitiveAdvantage?.mostLikely || 0),
      description: "Loss of proprietary algorithms, research data, and trade secrets",
      calculation: `${(loss.primary.components.competitiveAdvantage?.min || 0) / 1e6}-${(loss.primary.components.competitiveAdvantage?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.competitiveAdvantage?.mostLikely || 0) / 1e6}M`,
      rationale: "Iron Vortex exfiltrates data before encryption. Hyperion's HeliosAI platform includes proprietary genomic analysis algorithms, variant interpretation models, and curated genomic datasets that provide competitive differentiation. If exfiltrated, competitors could reverse-engineer these capabilities, eroding Hyperion's 18-24 month technology lead. Estimated value: $25M (representing 1-2 years of R&D investment in algorithmic IP).",
      benchmark: "Ponemon Institute: Trade secret theft costs average $10-50M for biotech/healthcare companies. Verizon DBIR 2024: IP theft occurs in 15% of ransomware incidents involving data exfiltration."
    },
    reputation: {
      title: "Reputation Damage (Year 1)",
      amount: formatCurrency(loss.primary.components.reputation?.mostLikely || 0),
      description: "Immediate customer churn and revenue loss from reputational damage",
      calculation: `${(loss.primary.components.reputation?.min || 0) / 1e6}-${(loss.primary.components.reputation?.max || 0) / 1e6}M range, most likely ${(loss.primary.components.reputation?.mostLikely || 0) / 1e6}M`,
      rationale: "Genomic data breaches have uniquely severe reputational impact - customers cannot change their DNA, making the breach permanent and unrecoverable. Estimated 15-20% customer churn in Year 1 as customers lose trust and switch to competitors. At $2.4B annual revenue, 15% churn = $360M revenue loss. This is 2-3× higher than typical healthcare breaches due to the irreversible nature of genetic information compromise.",
      benchmark: "External Source: 23andMe breach (2023): 30% customer decline in subsequent quarter. Anthem breach (2015): 12-15% customer churn over 18 months. IBM Cost of Breach 2024: Customer churn averages 3.9% for healthcare, but genetic testing sees 2-3× higher rates."
    },
    longTermRevenue: {
      title: "Long-Term Revenue Loss (Years 2-3)",
      amount: formatCurrency(loss.secondary.components.reputationDamage?.mostLikely || 0),
      description: "Sustained customer attrition and market share loss in years following breach",
      calculation: `${(loss.secondary.components.reputationDamage?.min || 0) / 1e6}-${(loss.secondary.components.reputationDamage?.max || 0) / 1e6}M range, most likely ${(loss.secondary.components.reputationDamage?.mostLikely || 0) / 1e6}M`,
      rationale: "Years 2-3 see continued customer attrition as breach reputation persists. Additional 5-10% revenue decline ($120M/year × 2 years = $240M). New customer acquisition slows as prospects choose competitors with unblemished security records. Genomic testing is a trust-intensive service - once trust is broken, recovery takes 3-5 years minimum.",
      benchmark: "IBM Cost of Breach 2024: Lost business costs (customer churn, acquisition costs) average 38% of total breach cost and persist for 2-3 years. Ponemon Institute: Healthcare breaches see 25-35% extended revenue impact beyond Year 1."
    },
    securityImprovements: {
      title: "Post-Breach Security Improvements",
      amount: formatCurrency(loss.secondary.components.responseCost?.mostLikely || 0),
      description: "Mandatory security enhancements required post-breach",
      calculation: `${(loss.secondary.components.responseCost?.min || 0) / 1e6}-${(loss.secondary.components.responseCost?.max || 0) / 1e6}M range, most likely ${(loss.secondary.components.responseCost?.mostLikely || 0) / 1e6}M`,
      rationale: "Post-breach, regulators and cyber insurers mandate security improvements: enterprise-wide phishing-resistant MFA ($5M), 24/7 SOC with advanced threat detection ($15M over 3 years), enhanced data loss prevention ($8M), third-party risk management program ($7M), penetration testing and red team exercises ($5M), security awareness transformation ($10M). Total: $50M in mandatory post-breach security investments.",
      benchmark: "Verizon DBIR 2024: Post-breach security improvements average 15-25% of total breach cost. Gartner: Organizations increase security spending 30-50% for 2-3 years following major breaches."
    },
    insurancePremium: {
      title: "Insurance Premium Increases",
      amount: formatCurrency(loss.secondary.components.finesJudgments?.mostLikely || 0),
      description: "Cyber insurance premium increases over 3 years following breach",
      calculation: `${(loss.secondary.components.finesJudgments?.min || 0) / 1e6}-${(loss.secondary.components.finesJudgments?.max || 0) / 1e6}M range, most likely ${(loss.secondary.components.finesJudgments?.mostLikely || 0) / 1e6}M`,
      rationale: "Current cyber insurance premium estimated at $5M/year. Post-breach, insurers reprice risk: Year 2: 3× increase to $15M (+$10M). Year 3: 2.5× increase to $12.5M (+$7.5M). Year 4: 2× increase to $10M (+$5M). Total 3-year excess premium: $22.5M. Some insurers may decline renewal, forcing Hyperion to self-insure portions of cyber risk.",
      benchmark: "External Source: Marsh McLennan Cyber Insurance Report 2024: Cyber premiums increase 200-400% following major breaches. AON: Healthcare cyber insurance rates increased 50-100% industry-wide in 2023-2024."
    },
    opportunityCosts: {
      title: "Opportunity Costs",
      amount: formatCurrency(loss.secondary.components.competitiveAdvantageLoss?.mostLikely || 0),
      description: "Lost partnerships, delayed product launches, and strategic setbacks",
      calculation: `${(loss.secondary.components.competitiveAdvantageLoss?.min || 0) / 1e6}-${(loss.secondary.components.competitiveAdvantageLoss?.max || 0) / 1e6}M range, most likely ${(loss.secondary.components.competitiveAdvantageLoss?.mostLikely || 0) / 1e6}M`,
      rationale: "Strategic partnerships with pharmaceutical companies and research institutions are delayed or cancelled due to security concerns ($30M in lost partnership revenue). Product launches delayed 6-12 months as organization focuses on breach recovery rather than innovation ($25M in delayed revenue). Competitive disadvantage as rivals capture market share during recovery period ($20M). Total opportunity cost: $75M.",
      benchmark: "Ponemon Institute: Opportunity costs (lost contracts, delayed initiatives) average 8-12% of total breach cost. Forrester Research: Healthcare breaches delay strategic initiatives by average of 9 months."
    }
  };

  const handleComponentClick = (componentKey: string) => {
    setSelectedComponent(componentDetails[componentKey]);
    setDialogOpen(true);
  };

  // Primary Loss Breakdown Pie Chart
  const primaryBreakdownData = {
    labels: [
      'Productivity Loss',
      'Response Costs',
      'Replacement Costs',
      'Fines & Judgments',
      'Competitive Advantage',
      'Reputation (Yr 1)'
    ],
    datasets: [
      {
        data: [
          loss.primary.components.productivity?.mostLikely || 0,
          loss.primary.components.response?.mostLikely || 0,
          loss.primary.components.replacement?.mostLikely || 0,
          loss.primary.components.finesJudgments?.mostLikely || 0,
          loss.primary.components.competitiveAdvantage?.mostLikely || 0,
          loss.primary.components.reputation?.mostLikely || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const secondaryBreakdownData = {
    labels: [
      'Long-Term Revenue',
      'Security Improvements',
      'Insurance Premium',
      'Opportunity Costs'
    ],
    datasets: [
      {
        data: [
          loss.secondary.components.reputationDamage?.mostLikely || 0,
          loss.secondary.components.responseCost?.mostLikely || 0,
          loss.secondary.components.finesJudgments?.mostLikely || 0,
          loss.secondary.components.competitiveAdvantageLoss?.mostLikely || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: {
            size: 11,
            weight: 'bold' as const
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
    }
  };

  const comparisonData = {
    labels: ['Primary Loss (Year 1)', 'Secondary Loss (Years 2-3)'],
    datasets: [
      {
        label: 'Loss Magnitude',
        data: [loss.primary.mostLikely, loss.secondary.mostLikely],
        backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(251, 146, 60, 0.8)'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
          callback: function (value: any) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    }
  };

  const ComponentCard = ({
    id,
    title,
    value,
    range,
    delay = 0
  }: {
    id: string;
    title: string;
    value: number;
    range: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={() => handleComponentClick(id)}
      className="cursor-pointer"
    >
      <Card className="relative glass-effect border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:bg-red-500/10 transition-colors duration-300">
        <div className="absolute top-3 right-3">
          <Info className="h-4 w-4 opacity-50 text-red-400" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500 dark:text-red-400">
            <AnimatedCurrency value={value} duration={2} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{range}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-red-500/10">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
              Loss Magnitude Breakdown
            </CardTitle>
            <CardDescription className="text-base ml-14">
              Detailed analysis of Primary and Secondary loss components • Click any component for details
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Total Loss Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComponentCard
          id="total"
          title="Total Loss Magnitude"
          value={loss.total.mostLikely}
          range={`Range: ${formatCurrency(loss.total.min)} - ${formatCurrency(loss.total.max)}`}
          delay={0.1}
        />
        <ComponentCard
          id="primary"
          title="Primary Loss (Year 1)"
          value={loss.primary.mostLikely}
          range={`Range: ${formatCurrency(loss.primary.min)} - ${formatCurrency(loss.primary.max)}`}
          delay={0.2}
        />
        <ComponentCard
          id="secondary"
          title="Secondary Loss (Years 2-3)"
          value={loss.secondary.mostLikely}
          range={`Range: ${formatCurrency(loss.secondary.min)} - ${formatCurrency(loss.secondary.max)}`}
          delay={0.3}
        />
      </div>

      {/* Primary vs Secondary Comparison */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="glass-effect border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Primary vs Secondary Loss Comparison
            </CardTitle>
            <CardDescription>Immediate (Year 1) vs Extended (Years 2-3) impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={comparisonData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Primary Loss Components */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Card className="glass-effect border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              Primary Loss Components (Year 1)
            </CardTitle>
            <CardDescription>Immediate financial impact within the fiscal year of the breach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pie Chart - Full Width */}
            <div className="h-80 w-full">
              <Pie data={primaryBreakdownData} options={pieOptions} />
            </div>
            {/* Component Cards - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ComponentCard
                id="finesJudgments"
                title="Fines & Judgments"
                value={loss.primary.components.finesJudgments?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.finesJudgments?.min || 0)} - ${formatCurrency(loss.primary.components.finesJudgments?.max || 0)}`}
                delay={0.6}
              />
              <ComponentCard
                id="reputation"
                title="Reputation Damage (Yr 1)"
                value={loss.primary.components.reputation?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.reputation?.min || 0)} - ${formatCurrency(loss.primary.components.reputation?.max || 0)}`}
                delay={0.65}
              />
              <ComponentCard
                id="productivity"
                title="Productivity Loss"
                value={loss.primary.components.productivity?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.productivity?.min || 0)} - ${formatCurrency(loss.primary.components.productivity?.max || 0)}`}
                delay={0.7}
              />
              <ComponentCard
                id="replacement"
                title="Replacement Costs"
                value={loss.primary.components.replacement?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.replacement?.min || 0)} - ${formatCurrency(loss.primary.components.replacement?.max || 0)}`}
                delay={0.75}
              />
              <ComponentCard
                id="competitiveAdvantage"
                title="Competitive Advantage Loss"
                value={loss.primary.components.competitiveAdvantage?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.competitiveAdvantage?.min || 0)} - ${formatCurrency(loss.primary.components.competitiveAdvantage?.max || 0)}`}
                delay={0.8}
              />
              <ComponentCard
                id="response"
                title="Response Costs"
                value={loss.primary.components.response?.mostLikely || 0}
                range={`${formatCurrency(loss.primary.components.response?.min || 0)} - ${formatCurrency(loss.primary.components.response?.max || 0)}`}
                delay={0.85}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary Loss Components */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="glass-effect border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              Secondary Loss Components (Years 2-3)
            </CardTitle>
            <CardDescription>Extended financial impact beyond the breach year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pie Chart - Full Width */}
            <div className="h-80 w-full">
              <Pie data={secondaryBreakdownData} options={pieOptions} />
            </div>
            {/* Component Cards - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComponentCard
                id="longTermRevenue"
                title="Long-Term Revenue Loss"
                value={loss.secondary.components.reputationDamage?.mostLikely || 0}
                range={`${formatCurrency(loss.secondary.components.reputationDamage?.min || 0)} - ${formatCurrency(loss.secondary.components.reputationDamage?.max || 0)}`}
                delay={0.95}
              />
              <ComponentCard
                id="securityImprovements"
                title="Post-Breach Security Improvements"
                value={loss.secondary.components.responseCost?.mostLikely || 0}
                range={`${formatCurrency(loss.secondary.components.responseCost?.min || 0)} - ${formatCurrency(loss.secondary.components.responseCost?.max || 0)}`}
                delay={1.0}
              />
              <ComponentCard
                id="insurancePremium"
                title="Insurance Premium Increases"
                value={loss.secondary.components.finesJudgments?.mostLikely || 0}
                range={`${formatCurrency(loss.secondary.components.finesJudgments?.min || 0)} - ${formatCurrency(loss.secondary.components.finesJudgments?.max || 0)}`}
                delay={1.05}
              />
              <ComponentCard
                id="opportunityCosts"
                title="Opportunity Costs"
                value={loss.secondary.components.competitiveAdvantageLoss?.mostLikely || 0}
                range={`${formatCurrency(loss.secondary.components.competitiveAdvantageLoss?.min || 0)} - ${formatCurrency(loss.secondary.components.competitiveAdvantageLoss?.max || 0)}`}
                delay={1.1}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* External Benchmarks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Card className="glass-effect border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-500" />
              Industry Benchmarks & External Data Sources
            </CardTitle>
            <CardDescription>Loss magnitude estimates validated against industry research</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">IBM Cost of a Data Breach Report 2024</h4>
                <p className="text-sm text-muted-foreground">
                  Healthcare average: ${(externalData.industryBenchmarks.healthcareBreachCost.value / 1e6).toFixed(2)}M per breach.
                  Global average: ${(externalData.industryBenchmarks.globalBreachCost.value / 1e6).toFixed(2)}M.
                  Mean time to identify: {externalData.industryBenchmarks.meanTimeToDetect.value} days, contain: {externalData.industryBenchmarks.meanTimeToContain.value} days.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Verizon Data Breach Investigations Report (DBIR) 2024</h4>
                <p className="text-sm text-muted-foreground">
                  {(externalData.industryBenchmarks.ransomwareSystemIntrusion.value * 100).toFixed(0)}% of system intrusion breaches involved ransomware.
                  {(externalData.industryBenchmarks.stolenCredentials.value * 100).toFixed(0)}% of breaches involved stolen credentials.
                  Average ransomware downtime: {externalData.industryBenchmarks.averageDowntime.value} days.
                  Average ransom demand: ${(externalData.industryBenchmarks.averageRansom.value / 1e6).toFixed(2)}M.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Regulatory Fine Precedents</h4>
                <p className="text-sm text-muted-foreground">
                  HIPAA: Anthem ($16M, 79M records), Premera ($6.85M, 10.4M records).
                  GDPR: Amazon (€746M), Meta (€1.2B), British Airways (€22M).
                  Hyperion's exposure (130M records, multi-jurisdictional) significantly exceeds historical precedents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedComponent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedComponent.title}</DialogTitle>
                <DialogDescription className="text-lg mt-2">
                  {selectedComponent.amount}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Description</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedComponent.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Calculation</h4>
                  <div className="bg-muted p-4 rounded text-sm">
                    {selectedComponent.calculation}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Rationale</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedComponent.rationale}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Industry Benchmark</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {selectedComponent.benchmark}
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
