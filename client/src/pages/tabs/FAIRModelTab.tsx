import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Shield, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FAIRData {
  threatEventFrequency: any;
  susceptibility: any;
  lossEventFrequency: any;
  lossMagnitude: any;
  annualizedLossExpectancy: any;
}

interface ComponentData {
  id: string;
  name: string;
  abbreviation: string;
  min: string;
  average: string;
  max: string;
  confidence: string;
  description: string;
  formula: string;
  rationale: string;
  color: string;
  borderColor: string;
}

export default function FAIRModelTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
    return `$${val.toLocaleString()}`;
  };

  const formatFrequency = (val: number) => val.toFixed(1);
  const formatPercent = (val: number) => `${(val * 100).toFixed(0)}%`;

  // FAIR Components with Min/Avg/Max values
  const components: ComponentData[] = [
    {
      id: 'risk',
      name: 'Risk (Loss Exposure)',
      abbreviation: 'ALE',
      min: formatCurrency(data.annualizedLossExpectancy.min),
      average: formatCurrency(data.annualizedLossExpectancy.mostLikely),
      max: formatCurrency(data.annualizedLossExpectancy.max),
      confidence: 'Medium',
      description: 'Annualized Loss Expectancy - probable frequency and magnitude of future loss',
      formula: 'Risk = LEF × LM',
      rationale: 'Represents total cyber risk exposure from Iron Vortex ransomware attack over 12 months. Based on 10,000 Monte Carlo simulations combining loss event frequency and loss magnitude estimates.',
      color: 'bg-red-500/10',
      borderColor: 'border-red-500'
    },
    {
      id: 'lef',
      name: 'Loss Event Frequency',
      abbreviation: 'LEF',
      min: formatFrequency(data.lossEventFrequency.min),
      average: formatFrequency(data.lossEventFrequency.mostLikely),
      max: formatFrequency(data.lossEventFrequency.max),
      confidence: 'Medium',
      description: 'Expected number of loss events per year',
      formula: 'LEF = TEF × Vulnerability',
      rationale: 'Calculated from threat event frequency (1.5/year) and vulnerability (80%). Represents approximately 1.2 successful breaches per year, or 96% probability of at least one breach within 12 months.',
      color: 'bg-orange-500/10',
      borderColor: 'border-orange-500'
    },
    {
      id: 'lm',
      name: 'Loss Magnitude',
      abbreviation: 'LM',
      min: formatCurrency(data.lossMagnitude.total.min),
      average: formatCurrency(data.lossMagnitude.total.mostLikely),
      max: formatCurrency(data.lossMagnitude.total.max),
      confidence: 'Medium',
      description: 'Expected financial impact per loss event',
      formula: 'LM = Primary Loss + Secondary Loss',
      rationale: 'Aggregated from primary ($1.05B) and secondary ($690M) loss estimates. Exceptionally high due to permanent, irreversible nature of genomic data compromise.',
      color: 'bg-blue-500/10',
      borderColor: 'border-blue-500'
    },
    {
      id: 'tef',
      name: 'Threat Event Frequency',
      abbreviation: 'TEF',
      min: formatFrequency(data.threatEventFrequency.min),
      average: formatFrequency(data.threatEventFrequency.mostLikely),
      max: formatFrequency(data.threatEventFrequency.max),
      confidence: 'High',
      description: 'Expected number of threat actions per year',
      formula: 'TEF = CF × PoA',
      rationale: 'Based on Iron Vortex campaign frequency (5.5/year) and probability they target Hyperion (27%). H-ISAC intelligence shows 1.5 expected attacks annually.',
      color: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500'
    },
    {
      id: 'vuln',
      name: 'Susceptibility (Vulnerability)',
      abbreviation: 'Susc',
      min: formatPercent(data.susceptibility.min),
      average: formatPercent(data.susceptibility.mostLikely),
      max: formatPercent(data.susceptibility.max),
      confidence: 'Medium',
      description: 'Probability that threat event becomes loss event',
      formula: 'Vuln = TCap × (1 - RS)',
      rationale: '80% vulnerability from threat capability (75%) vs. resistance strength (20%). Critical gaps: legacy MFA, outdated training, IAM over-permissiveness, third-party risk.',
      color: 'bg-pink-500/10',
      borderColor: 'border-pink-500'
    },
    {
      id: 'pl',
      name: 'Primary Loss',
      abbreviation: 'PL',
      min: formatCurrency(data.lossMagnitude.primary.min),
      average: formatCurrency(data.lossMagnitude.primary.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.max),
      confidence: 'Medium',
      description: 'Magnitude of primary losses per event',
      formula: 'PL = ProdL + RespC + ReplC',
      rationale: 'Primary loss magnitude ($1.322B) from direct incident impacts: productivity loss ($50M), response costs ($12M), replacement costs ($15M), plus regulatory fines ($870M), competitive advantage loss ($25M), and reputation damage ($350M). Medium confidence based on regulatory frameworks and industry benchmarks.',
      color: 'bg-green-600/10',
      borderColor: 'border-green-600'
    },
    {
      id: 'prodl',
      name: 'Productivity Loss',
      abbreviation: 'ProdL',
      min: formatCurrency(data.lossMagnitude.primary.components.productivity.min),
      average: formatCurrency(data.lossMagnitude.primary.components.productivity.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.productivity.max),
      confidence: 'High',
      description: 'Lost productivity during incident',
      formula: 'Downtime × Revenue Rate',
      rationale: 'Business interruption ($50M): 24-day average downtime (Verizon DBIR) × $2.1M daily revenue. HeliosAI platform unavailability prevents new patient onboarding and delays research partnerships.',
      color: 'bg-green-300/10',
      borderColor: 'border-green-300'
    },
    {
      id: 'respc-primary',
      name: 'Response Cost (Primary)',
      abbreviation: 'RespC',
      min: formatCurrency(data.lossMagnitude.primary.components.response.min),
      average: formatCurrency(data.lossMagnitude.primary.components.response.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.response.max),
      confidence: 'High',
      description: 'Immediate incident response costs',
      formula: 'Forensics + Legal + PR + Notifications',
      rationale: 'Incident response ($12M): forensic investigation ($3M), legal counsel ($2M), crisis PR ($1M), breach notifications ($4M for 130M records), credit monitoring ($2M). Based on IBM Cost of Breach 2024.',
      color: 'bg-green-400/10',
      borderColor: 'border-green-400'
    },
    {
      id: 'replc',
      name: 'Replacement Cost',
      abbreviation: 'ReplC',
      min: formatCurrency(data.lossMagnitude.primary.components.replacement.min),
      average: formatCurrency(data.lossMagnitude.primary.components.replacement.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.replacement.max),
      confidence: 'Medium',
      description: 'Asset replacement and recovery costs',
      formula: 'System Rebuild + Data Restoration',
      rationale: 'System rebuild and data restoration ($15M): AWS infrastructure rebuild ($5M), database restoration from backups ($8M), application redeployment ($2M). Assumes backups are intact and not compromised.',
      color: 'bg-green-500/10',
      borderColor: 'border-green-500'
    },
    {
      id: 'sl',
      name: 'Secondary Loss',
      abbreviation: 'SL',
      min: formatCurrency(data.lossMagnitude.secondary.min),
      average: formatCurrency(data.lossMagnitude.secondary.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.max),
      confidence: 'Low',
      description: 'Indirect costs following the loss event',
      formula: 'SL = Reputation + Customer Churn + Insurance',
      rationale: 'Includes customer churn ($500M - genetic data breach is unrecoverable), stock impact ($150M), insurance premium increase ($40M). Long-term reputation damage persists 2-3 years.',
      color: 'bg-purple-500/10',
      borderColor: 'border-purple-500'
    },
    {
      id: 'cf',
      name: 'Contact Frequency',
      abbreviation: 'CF',
      min: formatFrequency(data.threatEventFrequency.components.contactFrequency.min),
      average: formatFrequency(data.threatEventFrequency.components.contactFrequency.mostLikely),
      max: formatFrequency(data.threatEventFrequency.components.contactFrequency.max),
      confidence: 'High',
      description: 'How often threat actor acts against the organization',
      formula: 'Estimated from threat intelligence',
      rationale: 'Iron Vortex conducts 5.5 reconnaissance/targeting actions per year against genetic testing sector. Based on H-ISAC campaign tracking over 18 months.',
      color: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'poa',
      name: 'Probability of Action',
      abbreviation: 'PoA',
      min: formatPercent(data.threatEventFrequency.components.probabilityOfAction.min),
      average: formatPercent(data.threatEventFrequency.components.probabilityOfAction.mostLikely),
      max: formatPercent(data.threatEventFrequency.components.probabilityOfAction.max),
      confidence: 'Medium',
      description: 'Probability that contact results in threat action',
      formula: 'Estimated from targeting patterns',
      rationale: '27% probability Hyperion is selected per campaign. High-value target: 130M genomic records, $2.4B revenue, multi-region AWS infrastructure. Iron Vortex breached 2 similar companies in 6 months.',
      color: 'bg-violet-500/10',
      borderColor: 'border-violet-500'
    },
    {
      id: 'tcap',
      name: 'Threat Capability',
      abbreviation: 'TCap',
      min: formatPercent(0.75),
      average: formatPercent(data.susceptibility.threatCapability.overall / 100),
      max: formatPercent(0.85),
      confidence: 'High',
      description: 'Threat actor skill and resources',
      formula: 'Assessed from threat intelligence',
      rationale: '80th percentile threat capability. Iron Vortex demonstrates advanced persistent threat skills: custom malware, multi-stage attacks, cloud privilege escalation, sophisticated phishing.',
      color: 'bg-red-400/10',
      borderColor: 'border-red-400'
    },
    {
      id: 'rs',
      name: 'Resistance Strength',
      abbreviation: 'RS',
      min: formatPercent(data.susceptibility.resistanceStrength.min),
      average: formatPercent(data.susceptibility.resistanceStrength.mostLikely),
      max: formatPercent(data.susceptibility.resistanceStrength.max),
      confidence: 'Medium',
      description: 'Organization defensive capability',
      formula: 'Assessed from control effectiveness',
      rationale: '20% effective resistance despite strong foundation. Critical gaps: 60% MFA coverage (not phishing-resistant), 30% training effectiveness, cross-region IAM over-permissiveness, TestSure vendor risk.',
      color: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'slef',
      name: 'Secondary Loss Event Frequency',
      abbreviation: 'SLEF',
      min: formatFrequency(data.lossEventFrequency.min),
      average: formatFrequency(data.lossEventFrequency.mostLikely),
      max: formatFrequency(data.lossEventFrequency.max),
      confidence: 'Low',
      description: 'Frequency of secondary loss events',
      formula: 'SLEF = LEF (same as primary)',
      rationale: 'Secondary losses occur with same frequency as primary losses. Every breach that causes primary loss also generates secondary impacts (reputation damage, customer churn, insurance increases).',
      color: 'bg-purple-400/10',
      borderColor: 'border-purple-400'
    },
    {
      id: 'slm',
      name: 'Secondary Loss Magnitude',
      abbreviation: 'SLM',
      min: formatCurrency(data.lossMagnitude.secondary.min),
      average: formatCurrency(data.lossMagnitude.secondary.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.max),
      confidence: 'Low',
      description: 'Magnitude of secondary losses per event',
      formula: 'SLM = RespC + CAdvL + FinJu + Reputation',
      rationale: 'Secondary loss magnitude ($425M) from stakeholder reactions: response costs ($50M), competitive advantage loss ($75M), fines/judgments ($60M), reputation damage ($240M). Lower confidence due to difficulty predicting long-term market reactions.',
      color: 'bg-purple-600/10',
      borderColor: 'border-purple-600'
    },
    {
      id: 'respc',
      name: 'Response Cost',
      abbreviation: 'RespC',
      min: formatCurrency(data.lossMagnitude.secondary.components.responseCost.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.responseCost.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.responseCost.max),
      confidence: 'Medium',
      description: 'Secondary response costs from stakeholder reactions',
      formula: 'Estimated from post-breach requirements',
      rationale: 'Post-breach security improvements ($50M): enhanced monitoring, additional security tools, third-party assessments, compliance audits. Required by regulators, insurers, and customers.',
      color: 'bg-purple-300/10',
      borderColor: 'border-purple-300'
    },
    {
      id: 'cadvl',
      name: 'Competitive Advantage Loss',
      abbreviation: 'CAdvL',
      min: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.max),
      confidence: 'Low',
      description: 'Lost market position and competitive edge',
      formula: 'Estimated from market impact',
      rationale: 'Lost partnerships ($75M): R&D collaboration delays, cancelled strategic alliances, market share erosion to competitors. Genetic data breach creates permanent trust deficit in precision medicine market.',
      color: 'bg-purple-400/10',
      borderColor: 'border-purple-400'
    },
    {
      id: 'finju',
      name: 'Fines & Judgments',
      abbreviation: 'FinJu',
      min: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.max),
      confidence: 'Medium',
      description: 'Secondary legal and financial penalties',
      formula: 'Estimated from insurance and litigation',
      rationale: 'Insurance premium increases ($60M over 3 years), civil litigation settlements beyond primary legal costs. Cyber insurance market will re-rate Hyperion as high-risk after genomic data breach.',
      color: 'bg-purple-500/10',
      borderColor: 'border-purple-500'
    },
    {
      id: 'repd',
      name: 'Reputation Damage',
      abbreviation: 'RepD',
      min: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.max),
      confidence: 'Low',
      description: 'Long-term brand and reputation impact',
      formula: 'Estimated from customer attrition',
      rationale: 'Customer attrition and brand damage ($240M): Years 2-3 revenue loss, stock price impact, lost market valuation. Genetic data is irreplaceable - breach creates permanent loss of consumer trust.',
      color: 'bg-purple-700/10',
      borderColor: 'border-purple-700'
    },
  ];

  const componentMap = components.reduce((acc, comp) => {
    acc[comp.id] = comp;
    return acc;
  }, {} as Record<string, ComponentData>);

  const handleClick = (component: ComponentData) => {
    setSelectedComponent(component);
    setDialogOpen(true);
  };

  // Workbook-style component box
  const WorkbookBox = ({
    component,
    delay = 0,
    size = 'md'
  }: {
    component: ComponentData;
    delay?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }) => {
    const isHovered = hoveredId === component.id;

    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
      xl: 'p-6'
    };

    const titleSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        onHoverStart={() => setHoveredId(component.id)}
        onHoverEnd={() => setHoveredId(null)}
        onClick={() => handleClick(component)}
        className="cursor-pointer"
      >
        <Card className={`${component.color} border-2 ${component.borderColor} relative overflow-hidden transition-smooth hover:shadow-lg`}>
          {/* Animated background pulse */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <CardContent className={`${sizeClasses[size]} relative z-10`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className={`font-bold ${titleSizes[size]}`}>
                {component.name} ({component.abbreviation})
              </div>
              <motion.div
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Info className="h-4 w-4 opacity-50" />
              </motion.div>
            </div>

            {/* Min/Avg/Max Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1 font-semibold">Minimum</div>
                <motion.div
                  className="bg-background/60 backdrop-blur-sm rounded px-2 py-1.5 text-center font-mono text-sm border border-border/50"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  {component.min}
                </motion.div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 font-semibold">Average</div>
                <motion.div
                  className="bg-primary/20 backdrop-blur-sm rounded px-2 py-1.5 text-center font-mono text-sm font-bold border-2 border-primary/50"
                  whileHover={{ borderColor: "rgba(59, 130, 246, 1)" }}
                  animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {component.average}
                </motion.div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1 font-semibold">Maximum</div>
                <motion.div
                  className="bg-background/60 backdrop-blur-sm rounded px-2 py-1.5 text-center font-mono text-sm border border-border/50"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  {component.max}
                </motion.div>
              </div>
            </div>

            {/* Confidence */}
            <div className="text-xs text-center mb-2">
              <span className="text-muted-foreground">Confidence:</span>{' '}
              <span className="font-semibold">{component.confidence}</span>
            </div>



            {/* Hover indicator */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute bottom-2 right-2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Animated connector arrow
  const Arrow = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="flex justify-center my-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      >
        <div className="w-0.5 h-6 bg-gradient-to-b from-primary/50 to-primary"></div>
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-primary"></div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="h-6 w-6 text-primary" />
              </motion.div>
              FAIR Model - Official Workbook Layout
            </CardTitle>
            <CardDescription>
              Factor Analysis of Information Risk • Click any component for detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="border-primary/50">
                <Zap className="h-3 w-3 mr-1" />
                Interactive Components
              </Badge>
              <Badge variant="outline" className="border-orange-500/50">
                Monte Carlo Simulation (10,000 iterations)
              </Badge>
              <span className="text-xs text-muted-foreground">
                Based on FAIR Institute standard taxonomy
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAIR Model Diagram */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-7xl mx-auto">
            {/* Level 1: Risk */}
            <div className="mb-4">
              <WorkbookBox component={componentMap.risk} delay={0} size="xl" />
            </div>

            <Arrow delay={0.1} />

            {/* Level 2: LEF and LM */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <WorkbookBox component={componentMap.lef} delay={0.2} size="lg" />
              <WorkbookBox component={componentMap.lm} delay={0.3} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Arrow delay={0.4} />
              <Arrow delay={0.5} />
            </div>

            {/* Level 3: TEF, Vuln, PL, SL */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <WorkbookBox component={componentMap.tef} delay={0.6} />
              <WorkbookBox component={componentMap.vuln} delay={0.7} />
              <WorkbookBox component={componentMap.pl} delay={0.8} />
              <WorkbookBox component={componentMap.sl} delay={0.9} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Arrow delay={1.0} />
              <Arrow delay={1.1} />
              <Arrow delay={1.15} />
              <Arrow delay={1.17} />
            </div>

            {/* Level 4: CF, PoA, TCap, RS, PL sub-components, SL sub-components */}
            <div className="grid grid-cols-9 gap-2 mb-4">
              <WorkbookBox component={componentMap.cf} delay={1.2} size="sm" />
              <WorkbookBox component={componentMap.poa} delay={1.3} size="sm" />
              <WorkbookBox component={componentMap.tcap} delay={1.4} size="sm" />
              <WorkbookBox component={componentMap.rs} delay={1.5} size="sm" />
              <WorkbookBox component={componentMap.prodl} delay={1.55} size="sm" />
              <WorkbookBox component={componentMap['respc-primary']} delay={1.6} size="sm" />
              <WorkbookBox component={componentMap.replc} delay={1.65} size="sm" />
              <WorkbookBox component={componentMap.slef} delay={1.7} size="sm" />
              <WorkbookBox component={componentMap.slm} delay={1.75} size="sm" />
            </div>

            <div className="grid grid-cols-9 gap-2">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <Arrow delay={1.8} />
            </div>

            {/* Level 5: SLM Sub-components */}
            <div className="grid grid-cols-9 gap-2">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="grid grid-cols-2 gap-2">
                <WorkbookBox component={componentMap.respc} delay={1.9} size="sm" />
                <WorkbookBox component={componentMap.cadvl} delay={2.0} size="sm" />
              </div>
            </div>
            <div className="grid grid-cols-9 gap-2">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="grid grid-cols-2 gap-2">
                <WorkbookBox component={componentMap.finju} delay={2.1} size="sm" />
                <WorkbookBox component={componentMap.repd} delay={2.2} size="sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedComponent?.name} ({selectedComponent?.abbreviation})
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {selectedComponent?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedComponent && (
            <div className="space-y-4 mt-4">
              {/* Values Grid */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Minimum</div>
                  <div className="text-2xl font-bold font-mono">{selectedComponent.min}</div>
                </motion.div>
                <motion.div
                  className="p-4 bg-primary/20 rounded-lg border-2 border-primary"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Most Likely (Average)</div>
                  <div className="text-2xl font-bold font-mono">{selectedComponent.average}</div>
                </motion.div>
                <motion.div
                  className="p-4 bg-muted rounded-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-xs text-muted-foreground mb-1">Maximum</div>
                  <div className="text-2xl font-bold font-mono">{selectedComponent.max}</div>
                </motion.div>
              </div>

              {/* Formula */}
              <motion.div
                className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Calculation Formula
                </h4>
                <code className="text-sm bg-background/50 px-3 py-2 rounded block font-mono">
                  {selectedComponent.formula}
                </code>
              </motion.div>

              {/* Rationale */}
              <motion.div
                className="p-4 bg-green-500/10 rounded-lg border border-green-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-semibold text-lg mb-2">Estimation Rationale</h4>
                <p className="text-sm leading-relaxed">
                  {selectedComponent.rationale}
                </p>
              </motion.div>

              {/* Monte Carlo */}
              <motion.div
                className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="font-semibold text-lg mb-2">Monte Carlo Simulation</h4>
                <p className="text-sm leading-relaxed">
                  The Min, Average (Most Likely), and Max values are derived from <strong>10,000 Monte Carlo simulations</strong> that
                  model uncertainty and variability. The simulation uses PERT distributions for input parameters and aggregates
                  results to provide a probabilistic view of potential outcomes. This approach captures the full range of
                  possible scenarios rather than relying on single-point estimates.
                </p>
              </motion.div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
