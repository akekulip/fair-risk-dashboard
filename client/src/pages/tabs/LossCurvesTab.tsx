import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { TrendingDown, BarChart3, Info, AlertTriangle } from 'lucide-react';
import { AnimatedCurrency } from '@/components/AnimatedCounter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FAIRData {
  lossMagnitude: any;
  lossEventFrequency: any;
  annualizedLossExpectancy: any;
  monteCarloSimulation: any;
}

interface ChartDetail {
  title: string;
  description: string;
  interpretation: string;
  methodology: string;
  businessValue: string;
}

export default function LossCurvesTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // Triangular distribution random number generator
  function triangularRandom(min: number, mode: number, max: number): number {
    const u = Math.random();
    const f = (mode - min) / (max - min);

    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  // Generate Monte Carlo simulation data
  const simulationData = useMemo(() => {
    if (!data) return null;

    // Generate 10,000 samples using triangular distribution
    const samples = [];
    for (let i = 0; i < 10000; i++) {
      // TEF sample
      const tef = triangularRandom(
        data.lossEventFrequency.min,
        data.lossEventFrequency.mostLikely,
        data.lossEventFrequency.max
      );

      // Loss Magnitude sample
      const loss = triangularRandom(
        data.lossMagnitude.total.min,
        data.lossMagnitude.total.mostLikely,
        data.lossMagnitude.total.max
      );

      // ALE = LEF × Loss
      const ale = tef * loss;
      samples.push({ tef, loss, ale });
    }

    // Sort by ALE for exceedance curve
    samples.sort((a, b) => a.ale - b.ale);

    return samples;
  }, [data]);

  // Generate exceedance curve data
  const exceedanceCurve = useMemo(() => {
    if (!simulationData) return null;

    const points = [];
    const total = simulationData.length;

    // Sample every 100th point for performance
    for (let i = 0; i < total; i += 100) {
      const ale = simulationData[i].ale;
      const probability = (total - i) / total; // Probability of exceeding this value
      points.push({ x: ale / 1e9, y: probability * 100 }); // Convert to billions
    }

    return points;
  }, [simulationData]);

  // Generate loss distribution histogram
  const lossDistribution = useMemo(() => {
    if (!simulationData) return null;

    const bins = 50;
    const minLoss = Math.min(...simulationData.map(s => s.loss));
    const maxLoss = Math.max(...simulationData.map(s => s.loss));
    const binWidth = (maxLoss - minLoss) / bins;

    const histogram = new Array(bins).fill(0);
    const labels = [];

    for (let i = 0; i < bins; i++) {
      const binStart = minLoss + i * binWidth;
      labels.push((binStart / 1e9).toFixed(2));
    }

    simulationData.forEach(sample => {
      const binIndex = Math.min(Math.floor((sample.loss - minLoss) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    return { labels, data: histogram };
  }, [simulationData]);

  // Calculate key percentiles
  const percentiles = useMemo(() => {
    if (!simulationData) return null;

    const ales = simulationData.map(s => s.ale);
    return {
      p10: simulationData[Math.floor(ales.length * 0.10)].ale,
      p25: simulationData[Math.floor(ales.length * 0.25)].ale,
      p50: simulationData[Math.floor(ales.length * 0.50)].ale,
      p75: simulationData[Math.floor(ales.length * 0.75)].ale,
      p90: simulationData[Math.floor(ales.length * 0.90)].ale,
      p95: simulationData[Math.floor(ales.length * 0.95)].ale,
      p99: simulationData[Math.floor(ales.length * 0.99)].ale,
    };
  }, [simulationData]);

  if (!data || !simulationData || !exceedanceCurve || !lossDistribution || !percentiles) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Generating loss exceedance curves...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const chartDetails: Record<string, ChartDetail> = {
    exceedance: {
      title: "Loss Exceedance Curve (LEC)",
      description: "Probability that annual losses will exceed a given value",
      interpretation: "This curve is the most critical visualization for risk communication to executives and boards. It answers: 'What's the probability we'll lose more than $X this year?' For example, there's a 50% chance losses will exceed $2.02B (P50), a 10% chance they'll exceed $3.8B (P90), and a 1% chance they'll exceed $6.5B (P99). The steep slope in the middle indicates high confidence in the central estimate, while the long tail shows residual 'black swan' risk.",
      methodology: "Generated from 10,000 Monte Carlo iterations. Each point plots ALE (x-axis) against the percentage of simulations where losses exceeded that value (y-axis). This is the complement of the cumulative distribution function: Exceedance Probability = 1 - CDF. The curve is read right-to-left: moving right increases loss severity, moving up increases probability.",
      businessValue: "Executives use this curve to set risk appetite thresholds ('We cannot accept >5% chance of losses exceeding $5B') and evaluate insurance coverage levels. The P90 or P95 value often becomes the basis for cyber insurance limits or board-approved risk tolerance statements."
    },
    distribution: {
      title: "ALE Probability Distribution",
      description: "Frequency distribution showing the likelihood of different ALE outcomes",
      interpretation: "This histogram shows which ALE values are most likely. The peak around $2B represents the 'most probable' outcome—this is where the majority of Monte Carlo iterations landed. The distribution is right-skewed (long tail to the right), which is typical for cyber risk: most outcomes cluster around $1-3B, but there's a small probability of extreme losses exceeding $10B. The width of the distribution reflects uncertainty in both frequency and magnitude estimates.",
      methodology: "10,000 ALE samples from Monte Carlo simulation grouped into 50 equal-width bins. Each bar shows how many iterations fell within that bin's range. The shape emerges from the interaction of two triangular distributions (LEF and Loss Magnitude) multiplied together, which creates a more complex distribution than either input alone.",
      businessValue: "This visualization helps stakeholders understand the range of possible outcomes and the degree of uncertainty. A narrow, tall distribution indicates high confidence in the estimate; a wide, flat distribution indicates high uncertainty and suggests investing in better data collection or threat intelligence to narrow the range."
    },
    percentiles: {
      title: "Key Risk Percentiles",
      description: "Statistical benchmarks for decision-making and risk tolerance setting",
      interpretation: "Percentiles divide the risk distribution into decision-relevant thresholds. P50 ($2.02B) is the median—half of scenarios are better, half worse. P90 ($3.8B) represents a 'bad year'—only 10% of scenarios are worse. P99 ($6.5B) is a 'catastrophic' scenario with 1% probability. Organizations typically set risk appetite at P75-P90 ('We can tolerate losses up to the 90th percentile') and use P95-P99 to size insurance coverage for extreme events.",
      methodology: "Percentiles calculated by sorting all 10,000 ALE samples and selecting values at specific positions: P10 = 10th percentile (1,000th sample), P50 = median (5,000th sample), P99 = 99th percentile (9,900th sample). These correspond to specific probabilities on the exceedance curve.",
      businessValue: "Percentiles translate complex probability distributions into actionable numbers for budgeting, insurance procurement, and board reporting. CFOs use P50 for financial planning, CISOs use P90 for justifying security investments, and boards use P95-P99 to set insurance coverage limits."
    }
  };

  const handleChartClick = (chartKey: string) => {
    setSelectedChart(chartDetails[chartKey]);
    setDialogOpen(true);
  };

  const exceedanceChartData = {
    datasets: [
      {
        label: 'Probability of Exceedance',
        data: exceedanceCurve,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 3,
      },
    ],
  };

  const exceedanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return `Loss: $${context[0].parsed.x.toFixed(2)}B`;
          },
          label: function (context: any) {
            return `Probability of exceeding: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Annualized Loss Expectancy (Billions $)',
          color: '#fff'
        },
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Probability of Exceedance (%)',
          color: '#fff'
        },
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        min: 0,
        max: 100
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    }
  };

  const distributionChartData = {
    labels: lossDistribution.labels,
    datasets: [
      {
        label: 'Frequency',
        data: lossDistribution.data,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return `Loss: $${context[0].label}B`;
          },
          label: function (context: any) {
            return `Frequency: ${context.parsed.y} occurrences`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Loss Magnitude (Billions $)',
          color: '#fff'
        },
        ticks: {
          color: '#fff',
          maxTicksLimit: 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
          color: '#fff'
        },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Loss Exceedance Analysis
            </CardTitle>
            <CardDescription>
              Probability-based risk curves for executive decision-making • Click any chart for detailed explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="border-red-500/50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Critical Risk Communication Tool
              </Badge>
              <span className="text-muted-foreground">
                10,000 Monte Carlo iterations • 90% confidence intervals
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Percentiles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        whileHover={{ opacity: 0.9 }}
        onClick={() => handleChartClick('percentiles')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Key Risk Percentiles</CardTitle>
                <CardDescription>Statistical benchmarks for risk appetite and insurance sizing</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="text-xs text-muted-foreground mb-1">P10 (Optimistic)</div>
                <div className="text-xl font-bold text-green-600">
                  <AnimatedCurrency value={percentiles.p10} duration={2} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">90% chance of exceeding</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-xs text-muted-foreground mb-1">P50 (Median)</div>
                <div className="text-xl font-bold text-blue-600">
                  <AnimatedCurrency value={percentiles.p50} duration={2} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">50% chance of exceeding</div>
              </div>
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <div className="text-xs text-muted-foreground mb-1">P90 (Bad Year)</div>
                <div className="text-xl font-bold text-orange-600">
                  <AnimatedCurrency value={percentiles.p90} duration={2} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">10% chance of exceeding</div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="text-xs text-muted-foreground mb-1">P99 (Catastrophic)</div>
                <div className="text-xl font-bold text-red-600">
                  <AnimatedCurrency value={percentiles.p99} duration={2} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">1% chance of exceeding</div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">Risk Appetite Guidance</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Financial Planning:</strong> Use P50 ({formatCurrency(percentiles.p50)}) for budget reserves</p>
                <p><strong>Risk Tolerance:</strong> Set appetite at P75-P90 ({formatCurrency(percentiles.p75)} - {formatCurrency(percentiles.p90)})</p>
                <p><strong>Insurance Coverage:</strong> Size cyber insurance at P95-P99 ({formatCurrency(percentiles.p95)} - {formatCurrency(percentiles.p99)})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loss Exceedance Curve */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ opacity: 0.9 }}
        onClick={() => handleChartClick('exceedance')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loss Exceedance Curve (LEC)</CardTitle>
                <CardDescription>Probability that annual losses will exceed a given value</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Line data={exceedanceChartData} options={exceedanceOptions} />
            </div>
            <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-sm">
                <strong>How to Read:</strong> Find a loss value on the x-axis, trace up to the curve, then left to the y-axis
                to see the probability of exceeding that loss. Example: There's a ~10% chance (y-axis) of losses exceeding
                ${(percentiles.p90 / 1e9).toFixed(2)}B (x-axis).
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ALE Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileHover={{ opacity: 0.9 }}
        onClick={() => handleChartClick('distribution')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ALE Probability Distribution</CardTitle>
                <CardDescription>Frequency of different loss outcomes across 10,000 simulations</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Bar data={distributionChartData} options={distributionOptions} />
            </div>
            <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-sm">
                <strong>Distribution Characteristics:</strong> Right-skewed (long tail to the right) indicating asymmetric risk.
                Most outcomes cluster around $1-3B, but extreme scenarios can exceed $10B. The width reflects uncertainty in
                both attack frequency and impact magnitude.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Communication Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Communicating Risk to Executives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For the Board of Directors</h4>
              <p className="text-sm text-muted-foreground">
                "There is a 50% probability our annual cyber losses will exceed $2B, and a 10% probability they will exceed $3.8B.
                We recommend setting our risk appetite at the 90th percentile ($3.8B) and purchasing cyber insurance coverage up to
                the 99th percentile ($6.5B) to protect against catastrophic scenarios."
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For the CFO</h4>
              <p className="text-sm text-muted-foreground">
                "For financial planning purposes, we should reserve $2B (P50 median) for expected cyber risk costs. However, there's
                a 25% chance losses will exceed $2.5B (P75), so we recommend maintaining additional liquidity or insurance coverage
                to handle adverse scenarios without impacting operations."
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Risk Management</h4>
              <p className="text-sm text-muted-foreground">
                "The wide distribution ($600M to $10B+) reflects significant uncertainty in both attack likelihood and impact.
                Investing $30M in the proposed security controls could reduce the P50 from $2.02B to $685M (66% reduction),
                delivering 45x ROI and narrowing the uncertainty range substantially."
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedChart && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedChart.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedChart.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Interpretation</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedChart.interpretation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Methodology</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedChart.methodology}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Business Value</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedChart.businessValue}
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
