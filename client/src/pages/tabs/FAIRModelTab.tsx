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

// Workbook-style component box - Moved outside to prevent re-renders
const WorkbookBox = ({
  component,
  delay = 0,
  size = 'md',
  onClick
}: {
  component: ComponentData;
  delay?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick: (component: ComponentData) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-5'
  };

  const titleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  const valueSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(component)}
      className="cursor-pointer group relative"
    >
      <Card className={`${component.color} border ${component.borderColor} relative overflow-hidden transition-all duration-300 hover:shadow-md backdrop-blur-sm w-full h-full`}>
        {/* Animated background pulse */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <CardContent className={`${sizeClasses[size]} relative z-10 flex flex-col justify-between h-full`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-1.5">
            <div className={`font-bold ${titleSizes[size]} tracking-tight leading-tight truncate pr-1`}>
              {component.name} <span className="text-muted-foreground font-normal opacity-75">({component.abbreviation})</span>
            </div>
            {size !== 'sm' && (
              <motion.div
                animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Info className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )}
          </div>

          {/* Min/Avg/Max Grid */}
          <div className="grid grid-cols-3 gap-1 mb-1.5">
            <div>
              <div className="text-[8px] uppercase tracking-wider text-muted-foreground mb-0.5 font-semibold text-center">Min</div>
              <div className={`bg-background/40 backdrop-blur-md rounded px-1 py-0.5 text-center font-mono ${valueSizes[size]} border border-border/50 shadow-sm truncate`}>
                {component.min}
              </div>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-wider text-muted-foreground mb-0.5 font-semibold text-center">Avg</div>
              <div className={`bg-primary/10 backdrop-blur-md rounded px-1 py-0.5 text-center font-mono ${valueSizes[size]} font-bold border border-primary/50 shadow-sm truncate`}>
                {component.average}
              </div>
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-wider text-muted-foreground mb-0.5 font-semibold text-center">Max</div>
              <div className={`bg-background/40 backdrop-blur-md rounded px-1 py-0.5 text-center font-mono ${valueSizes[size]} border border-border/50 shadow-sm truncate`}>
                {component.max}
              </div>
            </div>
          </div>

          {/* Confidence */}
          {size !== 'sm' && (
            <div className="flex items-center justify-center gap-1.5 text-[10px]">
              <span className="text-muted-foreground">Conf:</span>
              <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-semibold bg-background/50 backdrop-blur-sm border border-border/50">
                {component.confidence}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Animated connector arrow
const Arrow = ({ delay = 0, vertical = true }: { delay?: number, vertical?: boolean }) => (
  <motion.div
    className={`flex justify-center ${vertical ? 'my-1' : 'mx-1'}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
  >
    <motion.div
      className="flex flex-col items-center"
      animate={vertical ? { y: [0, 3, 0] } : { x: [0, 3, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
    >
      {vertical ? (
        <>
          <div className="w-0.5 h-3 bg-gradient-to-b from-primary/50 to-primary"></div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary"></div>
        </>
      ) : (
        <>
          <div className="h-0.5 w-3 bg-gradient-to-r from-primary/50 to-primary"></div>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-primary"></div>
        </>
      )}
    </motion.div>
  </motion.div>
);

export default function FAIRModelTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const formatFrequency = (val: number) => val.toFixed(1);
  const formatPercent = (val: number) => `${(val * 100).toFixed(0)}%`;

  // FAIR Components with Min/Avg/Max values
  const components: ComponentData[] = [
    {
      id: 'risk',
      name: 'Risk (ALE)',
      abbreviation: 'ALE',
      min: formatCurrency(data.annualizedLossExpectancy.min),
      average: formatCurrency(data.annualizedLossExpectancy.mostLikely),
      max: formatCurrency(data.annualizedLossExpectancy.max),
      confidence: 'Med',
      description: 'Annualized Loss Expectancy',
      formula: 'Risk = LEF × LM',
      rationale: 'Total cyber risk exposure.',
      color: 'bg-red-500/10',
      borderColor: 'border-red-500'
    },
    {
      id: 'lef',
      name: 'Loss Event Freq',
      abbreviation: 'LEF',
      min: formatFrequency(data.lossEventFrequency.min),
      average: formatFrequency(data.lossEventFrequency.mostLikely),
      max: formatFrequency(data.lossEventFrequency.max),
      confidence: 'Med',
      description: 'Expected number of loss events per year',
      formula: 'LEF = TEF × Vuln',
      rationale: 'Frequency of successful breaches.',
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
      confidence: 'Med',
      description: 'Expected financial impact per loss event',
      formula: 'LM = PL + SL',
      rationale: 'Total financial impact.',
      color: 'bg-blue-500/10',
      borderColor: 'border-blue-500'
    },
    {
      id: 'tef',
      name: 'Threat Event Freq',
      abbreviation: 'TEF',
      min: formatFrequency(data.threatEventFrequency.min),
      average: formatFrequency(data.threatEventFrequency.mostLikely),
      max: formatFrequency(data.threatEventFrequency.max),
      confidence: 'High',
      description: 'Threat actions per year',
      formula: 'TEF = CF × PoA',
      rationale: 'Frequency of attacks.',
      color: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500'
    },
    {
      id: 'vuln',
      name: 'Vulnerability',
      abbreviation: 'Vuln',
      min: formatPercent(data.susceptibility.min),
      average: formatPercent(data.susceptibility.mostLikely),
      max: formatPercent(data.susceptibility.max),
      confidence: 'Med',
      description: 'Probability of success',
      formula: 'Vuln = TCap × (1 - RS)',
      rationale: 'Likelihood of defense failure.',
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
      confidence: 'Med',
      description: 'Direct losses',
      formula: 'PL = ProdL + RespC + ReplC',
      rationale: 'Direct impact costs.',
      color: 'bg-green-600/10',
      borderColor: 'border-green-600'
    },
    {
      id: 'sl',
      name: 'Secondary Loss',
      abbreviation: 'SL',
      min: formatCurrency(data.lossMagnitude.secondary.min),
      average: formatCurrency(data.lossMagnitude.secondary.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.max),
      confidence: 'Low',
      description: 'Indirect losses',
      formula: 'SL = Rep + Churn + Ins',
      rationale: 'Indirect impact costs.',
      color: 'bg-purple-500/10',
      borderColor: 'border-purple-500'
    },
    {
      id: 'cf',
      name: 'Contact Freq',
      abbreviation: 'CF',
      min: formatFrequency(data.threatEventFrequency.components.contactFrequency.min),
      average: formatFrequency(data.threatEventFrequency.components.contactFrequency.mostLikely),
      max: formatFrequency(data.threatEventFrequency.components.contactFrequency.max),
      confidence: 'High',
      description: 'Contact Frequency',
      formula: 'Intel',
      rationale: 'Rate of contact.',
      color: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500'
    },
    {
      id: 'poa',
      name: 'Prob of Action',
      abbreviation: 'PoA',
      min: formatPercent(data.threatEventFrequency.components.probabilityOfAction.min),
      average: formatPercent(data.threatEventFrequency.components.probabilityOfAction.mostLikely),
      max: formatPercent(data.threatEventFrequency.components.probabilityOfAction.max),
      confidence: 'Med',
      description: 'Probability of Action',
      formula: 'Intel',
      rationale: 'Likelihood of attack.',
      color: 'bg-violet-500/10',
      borderColor: 'border-violet-500'
    },
    {
      id: 'tcap',
      name: 'Threat Cap',
      abbreviation: 'TCap',
      min: formatPercent(0.75),
      average: formatPercent(data.susceptibility.threatCapability.overall / 100),
      max: formatPercent(0.85),
      confidence: 'High',
      description: 'Threat Capability',
      formula: 'Intel',
      rationale: 'Attacker skill.',
      color: 'bg-red-400/10',
      borderColor: 'border-red-400'
    },
    {
      id: 'rs',
      name: 'Resistance',
      abbreviation: 'RS',
      min: formatPercent(data.susceptibility.resistanceStrength.min),
      average: formatPercent(data.susceptibility.resistanceStrength.mostLikely),
      max: formatPercent(data.susceptibility.resistanceStrength.max),
      confidence: 'Med',
      description: 'Resistance Strength',
      formula: 'Controls',
      rationale: 'Defense strength.',
      color: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'prodl',
      name: 'Productivity',
      abbreviation: 'ProdL',
      min: formatCurrency(data.lossMagnitude.primary.components.productivity.min),
      average: formatCurrency(data.lossMagnitude.primary.components.productivity.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.productivity.max),
      confidence: 'High',
      description: 'Productivity Loss',
      formula: 'Downtime',
      rationale: 'Lost work.',
      color: 'bg-green-300/10',
      borderColor: 'border-green-300'
    },
    {
      id: 'respc-primary',
      name: 'Response',
      abbreviation: 'RespC',
      min: formatCurrency(data.lossMagnitude.primary.components.response.min),
      average: formatCurrency(data.lossMagnitude.primary.components.response.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.response.max),
      confidence: 'High',
      description: 'Response Cost',
      formula: 'IR',
      rationale: 'Incident response.',
      color: 'bg-green-400/10',
      borderColor: 'border-green-400'
    },
    {
      id: 'replc',
      name: 'Replacement',
      abbreviation: 'ReplC',
      min: formatCurrency(data.lossMagnitude.primary.components.replacement.min),
      average: formatCurrency(data.lossMagnitude.primary.components.replacement.mostLikely),
      max: formatCurrency(data.lossMagnitude.primary.components.replacement.max),
      confidence: 'Med',
      description: 'Replacement Cost',
      formula: 'Recovery',
      rationale: 'Hardware/Software.',
      color: 'bg-green-500/10',
      borderColor: 'border-green-500'
    },
    {
      id: 'slef',
      name: 'Sec LEF',
      abbreviation: 'SLEF',
      min: formatFrequency(data.lossEventFrequency.min),
      average: formatFrequency(data.lossEventFrequency.mostLikely),
      max: formatFrequency(data.lossEventFrequency.max),
      confidence: 'Low',
      description: 'Secondary LEF',
      formula: 'LEF',
      rationale: 'Same as primary.',
      color: 'bg-purple-400/10',
      borderColor: 'border-purple-400'
    },
    {
      id: 'slm',
      name: 'Sec LM',
      abbreviation: 'SLM',
      min: formatCurrency(data.lossMagnitude.secondary.min),
      average: formatCurrency(data.lossMagnitude.secondary.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.max),
      confidence: 'Low',
      description: 'Secondary LM',
      formula: 'Aggregated',
      rationale: 'Total secondary.',
      color: 'bg-purple-600/10',
      borderColor: 'border-purple-600'
    },
    {
      id: 'respc',
      name: 'Sec Resp',
      abbreviation: 'RespC',
      min: formatCurrency(data.lossMagnitude.secondary.components.responseCost.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.responseCost.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.responseCost.max),
      confidence: 'Med',
      description: 'Secondary Response',
      formula: 'Legal/PR',
      rationale: 'Post-breach.',
      color: 'bg-purple-300/10',
      borderColor: 'border-purple-300'
    },
    {
      id: 'cadvl',
      name: 'Comp Adv',
      abbreviation: 'CAdvL',
      min: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.competitiveAdvantageLoss.max),
      confidence: 'Low',
      description: 'Competitive Advantage',
      formula: 'Market',
      rationale: 'Market share.',
      color: 'bg-purple-400/10',
      borderColor: 'border-purple-400'
    },
    {
      id: 'finju',
      name: 'Fines',
      abbreviation: 'FinJu',
      min: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.finesJudgments.max),
      confidence: 'Med',
      description: 'Fines & Judgments',
      formula: 'Legal',
      rationale: 'Penalties.',
      color: 'bg-purple-500/10',
      borderColor: 'border-purple-500'
    },
    {
      id: 'repd',
      name: 'Reputation',
      abbreviation: 'RepD',
      min: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.min),
      average: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.mostLikely),
      max: formatCurrency(data.lossMagnitude.secondary.components.reputationDamage.max),
      confidence: 'Low',
      description: 'Reputation Damage',
      formula: 'Churn',
      rationale: 'Brand impact.',
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

  return (
    <div className="space-y-4">
      {/* FAIR Model Diagram - Compact View */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="w-full max-w-6xl mx-auto">
            {/* Level 1: Risk */}
            <div className="flex justify-center mb-2">
              <div className="w-64">
                <WorkbookBox component={componentMap.risk} delay={0} size="md" onClick={handleClick} />
              </div>
            </div>

            <Arrow delay={0.1} />

            {/* Level 2: LEF and LM */}
            <div className="flex justify-center gap-8 mb-2">
              <div className="w-56">
                <WorkbookBox component={componentMap.lef} delay={0.2} size="md" onClick={handleClick} />
              </div>
              <div className="w-56">
                <WorkbookBox component={componentMap.lm} delay={0.3} size="md" onClick={handleClick} />
              </div>
            </div>

            <div className="flex justify-center gap-64 mb-2">
              <Arrow delay={0.4} />
              <Arrow delay={0.5} />
            </div>

            {/* Level 3: TEF, Vuln, PL, SL */}
            <div className="flex justify-center gap-4 mb-2">
              <div className="w-40">
                <WorkbookBox component={componentMap.tef} delay={0.6} size="sm" onClick={handleClick} />
              </div>
              <div className="w-40">
                <WorkbookBox component={componentMap.vuln} delay={0.7} size="sm" onClick={handleClick} />
              </div>
              <div className="w-40">
                <WorkbookBox component={componentMap.pl} delay={0.8} size="sm" onClick={handleClick} />
              </div>
              <div className="w-40">
                <WorkbookBox component={componentMap.sl} delay={0.9} size="sm" onClick={handleClick} />
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-2">
              <div className="w-40 flex justify-center"><Arrow delay={1.0} /></div>
              <div className="w-40 flex justify-center"><Arrow delay={1.1} /></div>
              <div className="w-40 flex justify-center"><Arrow delay={1.15} /></div>
              <div className="w-40 flex justify-center"><Arrow delay={1.17} /></div>
            </div>

            {/* Level 4 & 5 Wrapper for alignment */}
            <div className="w-fit mx-auto">
              {/* Level 4: CF, PoA, TCap, RS, PL sub-components, SL sub-components */}
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-28"><WorkbookBox component={componentMap.cf} delay={1.2} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.poa} delay={1.3} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.tcap} delay={1.4} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.rs} delay={1.5} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.prodl} delay={1.55} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap['respc-primary']} delay={1.6} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.replc} delay={1.65} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.slef} delay={1.7} size="sm" onClick={handleClick} /></div>
                <div className="w-28"><WorkbookBox component={componentMap.slm} delay={1.75} size="sm" onClick={handleClick} /></div>
              </div>

              <div className="flex justify-end gap-2 mb-2 pr-[1.25rem]">
                <div className="w-28 flex justify-center"><Arrow delay={1.8} /></div>
              </div>

              {/* Level 5: SLM Sub-components */}
              <div className="flex justify-end gap-2">
                <div className="w-56 flex flex-wrap justify-center gap-2">
                  <div className="w-26"><WorkbookBox component={componentMap.respc} delay={1.9} size="sm" onClick={handleClick} /></div>
                  <div className="w-26"><WorkbookBox component={componentMap.cadvl} delay={2.0} size="sm" onClick={handleClick} /></div>
                  <div className="w-26"><WorkbookBox component={componentMap.finju} delay={2.1} size="sm" onClick={handleClick} /></div>
                  <div className="w-26"><WorkbookBox component={componentMap.repd} delay={2.2} size="sm" onClick={handleClick} /></div>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Component Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-950">
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
