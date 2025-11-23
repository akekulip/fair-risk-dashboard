import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingDown, DollarSign, Zap, RotateCcw, CheckCircle2, ArrowRight, Info, Save, FolderOpen, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCurrency } from '@/components/AnimatedCounter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScenarios } from '@/hooks/useScenarios';

interface ControlSettings {
  mfaCoverage: number;
  trainingEffectiveness: number;
  iamTightening: number;
  thirdPartyControls: number;
}

interface RiskMetrics {
  vulnerability: number;
  lef: number;
  ale: number;
  investmentCost: number;
  aleReduction: number;
  roi: number;
}

export default function WhatIfTab() {
  // Baseline values from current state
  const defaultBaseline: ControlSettings = {
    mfaCoverage: 60,
    trainingEffectiveness: 30,
    iamTightening: 50,
    thirdPartyControls: 30,
  };

  const [controls, setControls] = useState<ControlSettings>(defaultBaseline);
  const [baseline, setBaseline] = useState<ControlSettings>(defaultBaseline);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fairData, setFairData] = useState<any>(null);

  // Scenario Management
  const { scenarios: savedScenarios, saveScenario, loadScenario, deleteScenario } = useScenarios();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  // Baseline risk metrics - loaded from fair-data.json
  const [baselineMetrics, setBaselineMetrics] = useState<RiskMetrics>({
    vulnerability: 0.80,
    lef: 1.2,
    ale: 2.02e9,
    investmentCost: 0,
    aleReduction: 0,
    roi: 0,
  });

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(data => {
        setFairData(data);
        // Update baseline metrics from data
        setBaselineMetrics({
          vulnerability: data.susceptibility.mostLikely,
          lef: data.lossEventFrequency.mostLikely,
          ale: data.annualizedLossExpectancy.mostLikely,
          investmentCost: 0,
          aleReduction: 0,
          roi: 0,
        });
      })
      .catch(console.error);
  }, []);

  // Calculate risk metrics based on control settings
  const calculateMetrics = (settings: ControlSettings): RiskMetrics => {
    // Calculate resistance strength based on control effectiveness
    // Each control contributes to overall resistance
    const mfaResistance = settings.mfaCoverage / 100;
    const trainingResistance = settings.trainingEffectiveness / 100;
    const iamResistance = settings.iamTightening / 100;
    const thirdPartyResistance = settings.thirdPartyControls / 100;

    // Weighted average of control effectiveness
    // MFA and IAM are more impactful (30% each), training and 3rd party (20% each)
    const overallResistance = (
      mfaResistance * 0.30 +
      trainingResistance * 0.20 +
      iamResistance * 0.30 +
      thirdPartyResistance * 0.20
    );

    // Threat capability remains constant at 0.80 (from case study)
    const threatCapability = 0.80;

    // Vulnerability = Threat Capability × (1 - Resistance Strength)
    // Higher resistance = lower vulnerability
    const vulnerability = threatCapability * (1 - overallResistance * 0.85); // Max 85% reduction

    // LEF = TEF × Vulnerability
    // TEF is constant at 1.5 attacks/year (derived from case study)
    const tef = 1.5;
    const lef = tef * vulnerability;

    // ALE = LEF × SLE
    // SLE (Single Loss Expectancy) is constant at ~$1.7B (from case study)
    const sle = 1.7e9;
    const ale = lef * sle;

    // Calculate investment cost based on control improvements
    const mfaCost = Math.max(0, (settings.mfaCoverage - baseline.mfaCoverage)) * 25000; // $25K per percentage point
    const trainingCost = Math.max(0, (settings.trainingEffectiveness - baseline.trainingEffectiveness)) * 12500; // $12.5K per percentage point
    const iamCost = Math.max(0, (settings.iamTightening - baseline.iamTightening)) * 40000; // $40K per percentage point
    const thirdPartyCost = Math.max(0, (settings.thirdPartyControls - baseline.thirdPartyControls)) * 37500; // $37.5K per percentage point

    const investmentCost = mfaCost + trainingCost + iamCost + thirdPartyCost;

    // Calculate ALE reduction and ROI
    const aleReduction = baselineMetrics.ale - ale;
    const roi = investmentCost > 0 ? (aleReduction / investmentCost) : 0;

    return {
      vulnerability,
      lef,
      ale,
      investmentCost,
      aleReduction,
      roi,
    };
  };

  const currentMetrics = useMemo(() => calculateMetrics(controls), [controls, baselineMetrics]);

  // Predefined scenarios from Case Study
  const scenarios = {
    immediate: {
      name: "Immediate Actions",
      description: "MFA (FIDO2), Training, IAM tightening",
      settings: { mfaCoverage: 95, trainingEffectiveness: 60, iamTightening: 70, thirdPartyControls: 60 },
      cost: "$1.1M",
    },
    shortTerm: {
      name: "Short-Term Program",
      description: "Resilience, UEBA, Backup Hardening",
      settings: { mfaCoverage: 100, trainingEffectiveness: 80, iamTightening: 85, thirdPartyControls: 75 },
      cost: "$7.5M",
    },
    longTerm: {
      name: "Long-Term Transformation",
      description: "Zero Trust, Vendor Ecosystem Hardening",
      settings: { mfaCoverage: 100, trainingEffectiveness: 95, iamTightening: 95, thirdPartyControls: 95 },
      cost: "$21.5M",
    },
  };

  const handleReset = () => {
    setControls(baseline);
    setShowComparison(false);
  };

  const handleScenario = (scenarioKey: keyof typeof scenarios) => {
    const scenario = scenarios[scenarioKey];
    setControls(scenario.settings);
    setShowComparison(true);
  };

  const handleSliderChange = (key: keyof ControlSettings, value: number[]) => {
    setControls(prev => ({ ...prev, [key]: value[0] }));
    setShowComparison(true);
  };

  // Comparison chart data
  const comparisonChartData = {
    labels: ['Vulnerability', 'LEF', 'ALE (Billions)'],
    datasets: [
      {
        label: 'Baseline',
        data: [
          baselineMetrics.vulnerability * 100,
          baselineMetrics.lef,
          baselineMetrics.ale / 1e9,
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: 'With Controls',
        data: [
          currentMetrics.vulnerability * 100,
          currentMetrics.lef,
          currentMetrics.ale / 1e9,
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#fff' }
      },
      title: {
        display: true,
        text: 'Risk Reduction Comparison',
        color: '#fff'
      },
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    }
  };

  // Control effectiveness radar
  const controlRadarData = {
    labels: ['MFA Coverage', 'Security Training', 'IAM Controls', 'Third-Party Risk'],
    datasets: [
      {
        label: 'Baseline',
        data: [baseline.mfaCoverage, baseline.trainingEffectiveness, baseline.iamTightening, baseline.thirdPartyControls],
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
      {
        label: 'Current Settings',
        data: [controls.mfaCoverage, controls.trainingEffectiveness, controls.iamTightening, controls.thirdPartyControls],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#fff'
        },
        pointLabels: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#fff' }
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    }
  };

  const controlDescriptions: Record<keyof ControlSettings, { title: string; description: string; impact: string; cost: string }> = {
    mfaCoverage: {
      title: "Multi-Factor Authentication Coverage",
      description: "Percentage of privileged accounts protected by MFA (ideally phishing-resistant FIDO2)",
      impact: "Industry data shows MFA blocks 99% of automated attacks. Each 10% increase in coverage reduces credential theft risk proportionally. Moving from 60% to 100% coverage eliminates the single largest attack vector.",
      cost: "~$25K per percentage point increase. Includes FIDO2 hardware tokens, enrollment, and integration. 100% coverage = $1M total investment."
    },
    trainingEffectiveness: {
      title: "Security Awareness Training Effectiveness",
      description: "Measured reduction in phishing success rate through simulations and behavioral change",
      impact: "Baseline annual training achieves ~30% effectiveness. Monthly simulations + micro-learning can reach 70% effectiveness, reducing phishing success from 15% to 5%. Critical for defending against Iron Vortex's sophisticated spear-phishing.",
      cost: "~$12.5K per percentage point increase. Includes simulation platform, content development, and staff time. 70% effectiveness = $500K/year ongoing."
    },
    iamTightening: {
      title: "IAM & Access Control Tightening",
      description: "Strength of least-privilege enforcement, policy review, and credential management",
      impact: "Current 50% effectiveness reflects over-permissive policies and long-lived credentials. 85% effectiveness (through JIT access, short-lived tokens, automated review) reduces lateral movement and privilege escalation risk by 70%.",
      cost: "~$40K per percentage point increase. Includes IAM Access Analyzer, STS token migration, JIT tooling. 85% effectiveness = $1.4M one-time + $200K/year maintenance."
    },
    thirdPartyControls: {
      title: "Third-Party Vendor Risk Controls",
      description: "Security of TestSure and other vendor access to production genomic data",
      impact: "Current 30% effectiveness (shared credentials, stale audits, no monitoring) leaves supply chain attack vector wide open. 75% effectiveness (individual accounts, continuous monitoring, DLP) reduces third-party breach risk by 67%.",
      cost: "~$37.5K per percentage point increase. Includes IAM migration, monitoring tools, SOC 2 audits, DLP. 75% effectiveness = $1.7M one-time + $300K/year."
    }
  };

  const handleInfoClick = (controlKey: keyof ControlSettings) => {
    setSelectedScenario(controlKey);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calculator className="h-6 w-6 text-purple-500" />
              </div>
              What-If Analysis: Risk Reduction Scenarios
            </CardTitle>
            <CardDescription className="text-base ml-14">
              Adjust security controls to see real-time impact on risk metrics • Interactive ROI calculator
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <Badge variant="outline" className="border-purple-500/50 text-purple-500 bg-purple-500/5">
                <Zap className="h-3 w-3 mr-1" />
                Real-Time Calculation
              </Badge>
              <span className="text-muted-foreground font-medium">
                Adjust sliders to model security investment scenarios
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Scenario Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="glass-effect border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Scenarios
              </CardTitle>
              <CardDescription>Pre-configured security investment scenarios</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-blue-500/20 hover:bg-blue-500/10">
                    <Save className="h-4 w-4" />
                    Save Current
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Scenario</DialogTitle>
                    <DialogDescription>
                      Save your current control settings to reload later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newScenarioName}
                        onChange={(e) => setNewScenarioName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Q4 Plan"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      if (newScenarioName) {
                        saveScenario(newScenarioName, controls);
                        setNewScenarioName('');
                        setSaveDialogOpen(false);
                      }
                    }}>
                      Save Scenario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-blue-500/20 hover:bg-blue-500/10">
                    <FolderOpen className="h-4 w-4" />
                    Load Saved
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Load Scenario</DialogTitle>
                    <DialogDescription>
                      Select a saved scenario to load.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                    {savedScenarios.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No saved scenarios found.</p>
                    ) : (
                      savedScenarios.map((scenario) => (
                        <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="cursor-pointer flex-1" onClick={() => {
                            const data = loadScenario(scenario.id);
                            if (data) {
                              setControls(data);
                              setShowComparison(true);
                              setLoadDialogOpen(false);
                            }
                          }}>
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(scenario.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteScenario(scenario.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto flex flex-col items-start p-4 gap-2 border-blue-500/20 hover:bg-blue-500/5 hover:border-blue-500/50 transition-all"
                    onClick={() => handleScenario(key as keyof typeof scenarios)}
                  >
                    <div className="font-semibold text-blue-600 dark:text-blue-400">{scenario.name}</div>
                    <div className="text-xs text-muted-foreground text-left">{scenario.description}</div>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20">{scenario.cost}</Badge>
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Baseline
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interactive Control Sliders */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-500" />
              Adjust Security Controls
            </CardTitle>
            <CardDescription>Move sliders to customize your security investment scenario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MFA Coverage */}
            <motion.div
              className="space-y-3"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="font-semibold">MFA Coverage</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleInfoClick('mfaCoverage')}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <motion.div
                  key={controls.mfaCoverage}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-bold"
                >
                  {controls.mfaCoverage}%
                </motion.div>
              </div>
              <Slider
                value={[controls.mfaCoverage]}
                onValueChange={(value) => handleSliderChange('mfaCoverage', value)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Baseline: {baseline.mfaCoverage}%</span>
                <span>Target: 95-100%</span>
              </div>
            </motion.div>

            {/* Security Training */}
            <motion.div
              className="space-y-3"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="font-semibold">Security Training Effectiveness</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleInfoClick('trainingEffectiveness')}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <motion.div
                  key={controls.trainingEffectiveness}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-bold"
                >
                  {controls.trainingEffectiveness}%
                </motion.div>
              </div>
              <Slider
                value={[controls.trainingEffectiveness]}
                onValueChange={(value) => handleSliderChange('trainingEffectiveness', value)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Baseline: {baseline.trainingEffectiveness}%</span>
                <span>Target: 70%</span>
              </div>
            </motion.div>

            {/* IAM Controls */}
            <motion.div
              className="space-y-3"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="font-semibold">IAM Control Tightening</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleInfoClick('iamTightening')}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <motion.div
                  key={controls.iamTightening}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-bold"
                >
                  {controls.iamTightening}%
                </motion.div>
              </div>
              <Slider
                value={[controls.iamTightening]}
                onValueChange={(value) => handleSliderChange('iamTightening', value)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Baseline: {baseline.iamTightening}%</span>
                <span>Target: 85%</span>
              </div>
            </motion.div>

            {/* Third-Party Controls */}
            <motion.div
              className="space-y-3"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="font-semibold">Third-Party Risk Controls</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleInfoClick('thirdPartyControls')}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                <motion.div
                  key={controls.thirdPartyControls}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-bold"
                >
                  {controls.thirdPartyControls}%
                </motion.div>
              </div>
              <Slider
                value={[controls.thirdPartyControls]}
                onValueChange={(value) => handleSliderChange('thirdPartyControls', value)}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Baseline: {baseline.thirdPartyControls}%</span>
                <span>Target: 75%</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-Time Risk Metrics */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${controls.mfaCoverage}-${controls.trainingEffectiveness}-${controls.iamTightening}-${controls.thirdPartyControls}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-effect border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                Updated Risk Metrics
              </CardTitle>
              <CardDescription>Real-time calculation based on your control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-xs text-muted-foreground mb-1">Vulnerability</div>
                  <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                    {(currentMetrics.vulnerability * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {showComparison && (
                      <span className="text-green-600 dark:text-green-400">
                        ↓ {((baselineMetrics.vulnerability - currentMetrics.vulnerability) * 100).toFixed(1)}% reduction
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-xs text-muted-foreground mb-1">Loss Event Frequency</div>
                  <div className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                    {currentMetrics.lef.toFixed(2)}/year
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {showComparison && (
                      <span className="text-green-600 dark:text-green-400">
                        ↓ {((baselineMetrics.lef - currentMetrics.lef) / baselineMetrics.lef * 100).toFixed(0)}% reduction
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-xs text-muted-foreground mb-1">Annualized Loss Expectancy</div>
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    <AnimatedCurrency value={currentMetrics.ale} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {showComparison && (
                      <span className="text-green-600 dark:text-green-400">
                        ↓ {((baselineMetrics.ale - currentMetrics.ale) / baselineMetrics.ale * 100).toFixed(0)}% reduction
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* ROI Analysis */}
      {showComparison && currentMetrics.investmentCost > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                Return on Investment (ROI) Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-xs text-muted-foreground mb-1">Investment Required</div>
                  <div className="text-2xl font-bold text-purple-500 dark:text-purple-400">
                    <AnimatedCurrency value={currentMetrics.investmentCost} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">One-time + annual costs</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-xs text-muted-foreground mb-1">Annual Risk Reduction</div>
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    <AnimatedCurrency value={currentMetrics.aleReduction} duration={1} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((currentMetrics.aleReduction / baselineMetrics.ale) * 100).toFixed(0)}% ALE reduction
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-xs text-muted-foreground mb-1">ROI Ratio</div>
                  <div className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                    {currentMetrics.roi.toFixed(1)}x
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentMetrics.roi >= 10 ? 'Excellent ROI' : currentMetrics.roi >= 5 ? 'Strong ROI' : 'Positive ROI'}
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Business Case</h4>
                    <p className="text-sm text-muted-foreground">
                      Investing <strong>${(currentMetrics.investmentCost / 1e6).toFixed(1)}M</strong> in security controls
                      reduces annual cyber risk by <strong>${(currentMetrics.aleReduction / 1e9).toFixed(2)}B</strong>,
                      delivering a <strong>{currentMetrics.roi.toFixed(1)}x return</strong> on investment.
                      The payback period is approximately <strong>{(currentMetrics.investmentCost / currentMetrics.aleReduction * 12).toFixed(1)} months</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Charts */}
      {showComparison && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="glass-effect border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Risk Metrics: Before vs. After
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={comparisonChartData} options={comparisonOptions} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="glass-effect border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Control Effectiveness Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Radar data={controlRadarData} options={radarOptions} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Control Info Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedScenario && controlDescriptions[selectedScenario as keyof ControlSettings]
                ? controlDescriptions[selectedScenario as keyof ControlSettings].title
                : "Control Information"}
            </DialogTitle>
            {selectedScenario && controlDescriptions[selectedScenario as keyof ControlSettings] && (
              <DialogDescription className="text-base mt-2">
                {controlDescriptions[selectedScenario as keyof ControlSettings].description}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedScenario && controlDescriptions[selectedScenario as keyof ControlSettings] && (
            <>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Impact on Risk</h4>
                  <p className="text-sm leading-relaxed">
                    {controlDescriptions[selectedScenario as keyof ControlSettings].impact}
                  </p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-lg mb-2">Investment Cost</h4>
                  <p className="text-sm leading-relaxed">
                    {controlDescriptions[selectedScenario as keyof ControlSettings].cost}
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
