import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, TrendingUp, Info, Zap } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
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
  lossEventFrequency: any;
  lossMagnitude: any;
  annualizedLossExpectancy: any;
}

interface ChartDetail {
  title: string;
  description: string;
  interpretation: string;
  methodology: string;
}

export default function SimulationTab() {
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

    const samples = [];
    for (let i = 0; i < 10000; i++) {
      const lef = triangularRandom(
        data.lossEventFrequency.min,
        data.lossEventFrequency.mostLikely,
        data.lossEventFrequency.max
      );
      
      const loss = triangularRandom(
        data.lossMagnitude.total.min,
        data.lossMagnitude.total.mostLikely,
        data.lossMagnitude.total.max
      );
      
      const ale = lef * loss;
      samples.push({ lef, loss, ale });
    }

    samples.sort((a, b) => a.ale - b.ale);
    return samples;
  }, [data]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!simulationData) return null;

    const ales = simulationData.map(s => s.ale);
    const mean = ales.reduce((a, b) => a + b, 0) / ales.length;
    const variance = ales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / ales.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      min: Math.min(...ales),
      max: Math.max(...ales),
      p5: simulationData[Math.floor(ales.length * 0.05)].ale,
      p10: simulationData[Math.floor(ales.length * 0.10)].ale,
      p25: simulationData[Math.floor(ales.length * 0.25)].ale,
      p50: simulationData[Math.floor(ales.length * 0.50)].ale,
      p75: simulationData[Math.floor(ales.length * 0.75)].ale,
      p90: simulationData[Math.floor(ales.length * 0.90)].ale,
      p95: simulationData[Math.floor(ales.length * 0.95)].ale,
    };
  }, [simulationData]);

  // Generate histogram data
  const histogramData = useMemo(() => {
    if (!simulationData) return null;

    const bins = 50;
    const ales = simulationData.map(s => s.ale);
    const minAle = Math.min(...ales);
    const maxAle = Math.max(...ales);
    const binWidth = (maxAle - minAle) / bins;

    const histogram = new Array(bins).fill(0);
    const binLabels = [];

    for (let i = 0; i < bins; i++) {
      const binStart = minAle + i * binWidth;
      binLabels.push((binStart / 1e9).toFixed(2));
    }

    ales.forEach(ale => {
      const binIndex = Math.min(Math.floor((ale - minAle) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    return { labels: binLabels, data: histogram };
  }, [simulationData]);

  // Scatter plot data (LEF vs Loss)
  const scatterData = useMemo(() => {
    if (!simulationData) return null;

    // Sample every 50th point for performance
    return simulationData
      .filter((_, i) => i % 50 === 0)
      .map(s => ({ x: s.lef, y: s.loss / 1e9 }));
  }, [simulationData]);

  // Cumulative distribution
  const cumulativeData = useMemo(() => {
    if (!simulationData) return null;
    
    const points = [];
    for (let i = 0; i < simulationData.length; i += 100) {
      points.push({
        x: simulationData[i].ale / 1e9,
        y: (i / simulationData.length) * 100,
      });
    }
    return points;
  }, [simulationData]);

  if (!data || !simulationData || !statistics || !histogramData || !scatterData || !cumulativeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p>Running Monte Carlo simulation (10,000 iterations)...</p>
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
    histogram: {
      title: "ALE Distribution Histogram",
      description: "Frequency distribution of Annualized Loss Expectancy across 10,000 Monte Carlo iterations",
      interpretation: "This histogram shows how likely different ALE values are. The peak around $2B indicates the most probable outcome. The long tail to the right represents low-probability, high-impact scenarios. The distribution is right-skewed, meaning there's a small but real chance of losses exceeding $10B in extreme scenarios.",
      methodology: "Monte Carlo simulation with 10,000 iterations. Each iteration randomly samples LEF and Loss Magnitude from triangular distributions (min, most likely, max) and calculates ALE = LEF × LM. Results are grouped into 50 bins to create the histogram. This approach captures the full range of uncertainty in both frequency and magnitude estimates."
    },
    cumulative: {
      title: "Cumulative Distribution Function (CDF)",
      description: "Probability that ALE will be less than or equal to a given value",
      interpretation: "This curve answers the question: 'What's the probability that losses will be below X?' For example, there's a 50% chance ALE will be below $2.02B (median), and a 90% chance it will be below $3.8B. The steep slope in the middle indicates high confidence in the central estimate, while the long tail shows residual uncertainty in extreme scenarios.",
      methodology: "Cumulative distribution calculated by sorting all 10,000 ALE samples and plotting the percentage of samples below each value. This transforms the histogram into a cumulative probability curve, making it easier to read specific percentile values (e.g., 'There's a 95% chance losses won't exceed $X')."
    },
    scatter: {
      title: "LEF vs Loss Magnitude Correlation",
      description: "Relationship between Loss Event Frequency and Loss Magnitude across simulations",
      interpretation: "This scatter plot shows that LEF and Loss Magnitude are independent variables (no correlation pattern visible). Each point represents one simulation iteration. The clustering shows that most scenarios fall within 0.6-1.8 events/year and $1.0-2.5B loss magnitude. Outliers in the upper-right represent worst-case scenarios with both high frequency and high magnitude.",
      methodology: "Each point plots one Monte Carlo iteration's LEF (x-axis) vs Loss Magnitude (y-axis). Sampled every 50th iteration (200 points total) for visualization performance. Independence of variables is a key FAIR assumption - frequency and magnitude are estimated separately and combined multiplicatively."
    },
    percentiles: {
      title: "Percentile Analysis",
      description: "Statistical distribution of ALE across key percentiles",
      interpretation: "Percentiles provide decision-makers with a range of outcomes: P5 ($610M) represents a best-case scenario with low likelihood, P50 ($2.02B) is the median/most likely outcome, and P95 ($4.58B) represents a worst-case scenario that still has a 5% chance of being exceeded. The wide range ($610M to $4.58B) reflects significant uncertainty in both frequency and magnitude estimates.",
      methodology: "Percentiles calculated by sorting 10,000 ALE samples and selecting values at specific positions: P5 = 5th percentile (500th sample), P50 = median (5,000th sample), P95 = 95th percentile (9,500th sample). These values correspond to the cumulative distribution function at 5%, 50%, and 95% probability levels."
    }
  };

  const handleChartClick = (chartKey: string) => {
    setSelectedChart(chartDetails[chartKey]);
    setDialogOpen(true);
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    delay = 0,
    onClick 
  }: {
    title: string;
    value: number;
    description: string;
    delay?: number;
    onClick?: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card className="relative">
        {onClick && (
          <div className="absolute top-3 right-3">
            <Info className="h-4 w-4 opacity-50" />
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedCurrency value={value} duration={2} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const histogramChartData = {
    labels: histogramData.labels,
    datasets: [
      {
        label: 'Frequency',
        data: histogramData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context: any) {
            return `ALE: $${context[0].label}B`;
          },
          label: function(context: any) {
            return `Frequency: ${context.parsed.y} occurrences`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Annualized Loss Expectancy (Billions $)',
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

  const cumulativeChartData = {
    datasets: [
      {
        label: 'Cumulative Probability',
        data: cumulativeData,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const cumulativeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(context: any) {
            return `ALE: $${context[0].parsed.x.toFixed(2)}B`;
          },
          label: function(context: any) {
            return `Probability ≤ this value: ${context.parsed.y.toFixed(1)}%`;
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
          text: 'Cumulative Probability (%)',
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

  const scatterChartData = {
    datasets: [
      {
        label: 'LEF vs Loss',
        data: scatterData,
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        pointRadius: 4,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `LEF: ${context.parsed.x.toFixed(2)}, Loss: $${context.parsed.y.toFixed(2)}B`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'Loss Event Frequency (events/year)',
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
          text: 'Loss Magnitude (Billions $)',
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
        <Card className="border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Monte Carlo Simulation Results
            </CardTitle>
            <CardDescription>
              10,000 iterations modeling uncertainty in LEF and Loss Magnitude • Click any chart for methodology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="border-green-500/50">
                <Activity className="h-3 w-3 mr-1" />
                Simulation Complete
              </Badge>
              <span className="text-muted-foreground">
                Triangular distributions • 90% confidence intervals
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Mean ALE"
          value={statistics.mean}
          description="Average across all iterations"
          delay={0.1}
          onClick={() => handleChartClick('percentiles')}
        />
        <StatCard
          title="Median ALE (P50)"
          value={statistics.p50}
          description="50th percentile"
          delay={0.15}
          onClick={() => handleChartClick('percentiles')}
        />
        <StatCard
          title="Standard Deviation"
          value={statistics.stdDev}
          description="Measure of uncertainty"
          delay={0.2}
          onClick={() => handleChartClick('percentiles')}
        />
        <StatCard
          title="P95 (Worst Case)"
          value={statistics.p95}
          description="95th percentile"
          delay={0.25}
          onClick={() => handleChartClick('percentiles')}
        />
      </div>

      {/* Percentile Breakdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => handleChartClick('percentiles')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Percentile Analysis</CardTitle>
                <CardDescription>Statistical distribution of ALE outcomes</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">P5 (Best Case)</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(statistics.p5)}</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">P25</div>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(statistics.p25)}</div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">P75</div>
                <div className="text-lg font-bold text-orange-600">{formatCurrency(statistics.p75)}</div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">P95 (Worst Case)</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(statistics.p95)}</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <strong>90% Confidence Interval:</strong> {formatCurrency(statistics.p5)} - {formatCurrency(statistics.p95)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                There is a 90% probability that the actual ALE will fall within this range
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Histogram */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => handleChartClick('histogram')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ALE Distribution Histogram</CardTitle>
                <CardDescription>Frequency of ALE values across 10,000 simulations</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Bar data={histogramChartData} options={histogramOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cumulative Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => handleChartClick('cumulative')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cumulative Distribution Function (CDF)</CardTitle>
                <CardDescription>Probability that ALE will be ≤ a given value</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Line data={cumulativeChartData} options={cumulativeOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scatter Plot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => handleChartClick('scatter')}
        className="cursor-pointer"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>LEF vs Loss Magnitude Correlation</CardTitle>
                <CardDescription>Relationship between frequency and magnitude (200 sample points)</CardDescription>
              </div>
              <Info className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Scatter data={scatterChartData} options={scatterOptions} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Simulation Methodology */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Simulation Methodology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Monte Carlo Approach</h4>
              <p className="text-sm text-muted-foreground">
                10,000 iterations randomly sampling from triangular distributions for both LEF (min: {data.lossEventFrequency.min}, 
                most likely: {data.lossEventFrequency.mostLikely}, max: {data.lossEventFrequency.max}) and 
                Loss Magnitude (min: {formatCurrency(data.lossMagnitude.total.min)}, 
                most likely: {formatCurrency(data.lossMagnitude.total.mostLikely)}, 
                max: {formatCurrency(data.lossMagnitude.total.max)}).
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Triangular Distribution Rationale</h4>
              <p className="text-sm text-muted-foreground">
                Triangular distributions are used when you have three-point estimates (min, most likely, max) but limited historical data. 
                They're more realistic than uniform distributions (which assume all values are equally likely) and easier to parameterize 
                than normal distributions (which require mean and standard deviation). The FAIR methodology recommends triangular distributions 
                for cyber risk quantification when working with expert estimates rather than actuarial data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Confidence Intervals</h4>
              <p className="text-sm text-muted-foreground">
                The 90% confidence interval ({formatCurrency(statistics.p5)} - {formatCurrency(statistics.p95)}) represents the range 
                within which we expect the true ALE to fall 90% of the time. This wide range reflects the inherent uncertainty in estimating 
                both the likelihood and impact of a sophisticated ransomware attack. Decision-makers should focus on the P50 (median) for 
                planning purposes while preparing contingencies for the P90-P95 range.
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
