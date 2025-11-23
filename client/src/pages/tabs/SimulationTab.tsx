import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Activity, BarChart3, TrendingUp, Info, Zap, Play, RotateCcw, Settings2 } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
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

interface SimulationParams {
  lefMin: number;
  lefMode: number;
  lefMax: number;
  lmMin: number;
  lmMode: number;
  lmMax: number;
  iterations: number;
}

export default function SimulationTab() {
  const [defaultData, setDefaultData] = useState<FAIRData | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    lefMin: 0.6,
    lefMode: 0.96,
    lefMax: 1.8,
    lmMin: 500000000,
    lmMode: 5000000000,
    lmMax: 20000000000,
    iterations: 5000
  });

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(data => {
        setDefaultData(data);
        // Initialize params from default data
        setParams({
          lefMin: data.lossEventFrequency.min,
          lefMode: data.lossEventFrequency.mostLikely,
          lefMax: data.lossEventFrequency.max,
          lmMin: data.lossMagnitude.total.min,
          lmMode: data.lossMagnitude.total.mostLikely,
          lmMax: data.lossMagnitude.total.max,
          iterations: 5000
        });
      })
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

  // Run simulation with current parameters
  const runSimulation = useCallback(() => {
    setIsSimulating(true);

    // Simulate async behavior for UX
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);

    return params;
  }, [params]);

  // Generate Monte Carlo simulation data
  const simulationData = useMemo(() => {
    if (!params) return null;

    const samples = [];
    for (let i = 0; i < params.iterations; i++) {
      const lef = triangularRandom(params.lefMin, params.lefMode, params.lefMax);
      const loss = triangularRandom(params.lmMin, params.lmMode, params.lmMax);
      const ale = lef * loss;
      samples.push({ lef, loss, ale });
    }

    samples.sort((a, b) => a.ale - b.ale);
    return samples;
  }, [params]);

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

    // Sample every 25th point for performance
    return simulationData
      .filter((_, i) => i % 25 === 0)
      .map(s => ({ x: s.lef, y: s.loss / 1e9 }));
  }, [simulationData]);

  // Cumulative distribution
  const cumulativeData = useMemo(() => {
    if (!simulationData) return null;

    const points = [];
    for (let i = 0; i < simulationData.length; i += 50) {
      points.push({
        x: simulationData[i].ale / 1e9,
        y: (i / simulationData.length) * 100,
      });
    }
    return points;
  }, [simulationData]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const resetToDefaults = () => {
    if (defaultData) {
      setParams({
        lefMin: defaultData.lossEventFrequency.min,
        lefMode: defaultData.lossEventFrequency.mostLikely,
        lefMax: defaultData.lossEventFrequency.max,
        lmMin: defaultData.lossMagnitude.total.min,
        lmMode: defaultData.lossMagnitude.total.mostLikely,
        lmMax: defaultData.lossMagnitude.total.max,
        iterations: 5000
      });
    }
  };

  if (!defaultData || !simulationData || !statistics || !histogramData || !scatterData || !cumulativeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p>Loading simulation engine...</p>
        </div>
      </div>
    );
  }

  const chartDetails: Record<string, ChartDetail> = {
    histogram: {
      title: "ALE Distribution Histogram",
      description: `Frequency distribution of Annualized Loss Expectancy across ${params.iterations.toLocaleString()} Monte Carlo iterations`,
      interpretation: "This histogram shows how likely different ALE values are. The peak indicates the most probable outcome. The distribution shape reveals the range of uncertainty in both frequency and magnitude estimates.",
      methodology: `Monte Carlo simulation with ${params.iterations.toLocaleString()} iterations. Each iteration randomly samples LEF and Loss Magnitude from triangular distributions (min, most likely, max) and calculates ALE = LEF × LM.`
    },
    cumulative: {
      title: "Cumulative Distribution Function (CDF)",
      description: "Probability that ALE will be less than or equal to a given value",
      interpretation: "This curve answers: 'What's the probability that losses will be below X?' The steep slope in the middle indicates high confidence in the central estimate, while the tail shows residual uncertainty.",
      methodology: `Cumulative distribution calculated by sorting all ${params.iterations.toLocaleString()} ALE samples and plotting the percentage of samples below each value.`
    },
    scatter: {
      title: "LEF vs Loss Magnitude Correlation",
      description: "Relationship between Loss Event Frequency and Loss Magnitude across simulations",
      interpretation: "This scatter plot shows that LEF and Loss Magnitude are independent variables. Each point represents one simulation iteration. The clustering shows where most scenarios fall.",
      methodology: "Each point plots one Monte Carlo iteration's LEF (x-axis) vs Loss Magnitude (y-axis). Sampled for visualization performance."
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
    delay = 0
  }: {
    title: string;
    value: number;
    description: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      key={value} // Re-animate on value change
    >
      <Card className="glass-effect hover:shadow-professional transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="metric-label text-xs uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground tracking-tight">
            <AnimatedCurrency value={value} duration={1.5} />
          </div>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">{description}</p>
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return `ALE: $${context[0].label}B`;
          },
          label: function (context: any) {
            return `Frequency: ${context.parsed.y} occurrences`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Annualized Loss Expectancy (Billions $)', color: '#fff' },
        ticks: { color: '#fff', maxTicksLimit: 10 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Frequency', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    animation: {
      duration: 1000,
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            return `ALE: $${context[0].parsed.x.toFixed(2)}B`;
          },
          label: function (context: any) {
            return `Probability ≤ this value: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: { display: true, text: 'Annualized Loss Expectancy (Billions $)', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Cumulative Probability (%)', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        min: 0,
        max: 100
      }
    },
    animation: {
      duration: 1000,
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
        pointRadius: 3,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `LEF: ${context.parsed.x.toFixed(2)}, Loss: $${context.parsed.y.toFixed(2)}B`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        title: { display: true, text: 'Loss Event Frequency (events/year)', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Loss Magnitude (Billions $)', color: '#fff' },
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    animation: {
      duration: 1000,
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
        <Card className="border-blue-500/50 glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Interactive Monte Carlo Simulation
            </CardTitle>
            <CardDescription>
              Adjust parameters to explore different risk scenarios • Real-time results with {params.iterations.toLocaleString()} iterations
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* 2-Column Layout: Controls + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Parameter Controls (2 columns) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="h-5 w-5" />
                Simulation Parameters
              </CardTitle>
              <CardDescription>Adjust values to see real-time impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loss Event Frequency */}
              <div className="space-y-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Loss Event Frequency (events/year)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Minimum: {formatNumber(params.lefMin)}
                    </label>
                    <Slider
                      value={[params.lefMin]}
                      onValueChange={([value]) => setParams({ ...params, lefMin: value })}
                      min={0}
                      max={params.lefMode}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Most Likely: {formatNumber(params.lefMode)}
                    </label>
                    <Slider
                      value={[params.lefMode]}
                      onValueChange={([value]) => setParams({ ...params, lefMode: value })}
                      min={params.lefMin}
                      max={params.lefMax}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Maximum: {formatNumber(params.lefMax)}
                    </label>
                    <Slider
                      value={[params.lefMax]}
                      onValueChange={([value]) => setParams({ ...params, lefMax: value })}
                      min={params.lefMode}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Loss Magnitude */}
              <div className="space-y-4 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  Loss Magnitude (per event)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Minimum: {formatCurrency(params.lmMin)}
                    </label>
                    <Slider
                      value={[params.lmMin / 1e9]}
                      onValueChange={([value]) => setParams({ ...params, lmMin: value * 1e9 })}
                      min={0}
                      max={params.lmMode / 1e9}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Most Likely: {formatCurrency(params.lmMode)}
                    </label>
                    <Slider
                      value={[params.lmMode / 1e9]}
                      onValueChange={([value]) => setParams({ ...params, lmMode: value * 1e9 })}
                      min={params.lmMin / 1e9}
                      max={params.lmMax / 1e9}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Maximum: {formatCurrency(params.lmMax)}
                    </label>
                    <Slider
                      value={[params.lmMax / 1e9]}
                      onValueChange={([value]) => setParams({ ...params, lmMax: value * 1e9 })}
                      min={params.lmMode / 1e9}
                      max={50}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Iterations */}
              <div className="space-y-3 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  Iterations: {params.iterations.toLocaleString()}
                </h4>
                <Slider
                  value={[params.iterations]}
                  onValueChange={([value]) => setParams({ ...params, iterations: value })}
                  min={100}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  More iterations = higher accuracy (slower)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={runSimulation}
                  className="flex-1"
                  disabled={isSimulating}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isSimulating ? 'Running...' : 'Re-run Simulation'}
                </Button>
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT: Results (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Key Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Mean ALE"
                value={statistics.mean}
                description="Average outcome"
                delay={0}
              />
              <StatCard
                title="Median (P50)"
                value={statistics.p50}
                description="50th percentile"
                delay={0.05}
              />
              <StatCard
                title="Std Deviation"
                value={statistics.stdDev}
                description="Uncertainty measure"
                delay={0.1}
              />
              <StatCard
                title="P95 Worst Case"
                value={statistics.p95}
                description="95th percentile"
                delay={0.15}
              />
            </div>
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Histogram */}
            <Card className="transition-smooth hover:shadow-lg cursor-pointer" onClick={() => handleChartClick('histogram')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">ALE Distribution</CardTitle>
                    <CardDescription className="text-xs">Frequency across simulations</CardDescription>
                  </div>
                  <Info className="h-4 w-4 opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar data={histogramChartData} options={histogramOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Cumulative */}
            <Card className="transition-smooth hover:shadow-lg cursor-pointer" onClick={() => handleChartClick('cumulative')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Cumulative Distribution</CardTitle>
                    <CardDescription className="text-xs">Probability ≤ value</CardDescription>
                  </div>
                  <Info className="h-4 w-4 opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line data={cumulativeChartData} options={cumulativeOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Scatter */}
            <Card className="transition-smooth hover:shadow-lg cursor-pointer" onClick={() => handleChartClick('scatter')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">LEF vs Loss Magnitude</CardTitle>
                    <CardDescription className="text-xs">Correlation analysis</CardDescription>
                  </div>
                  <Info className="h-4 w-4 opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Scatter data={scatterChartData} options={scatterOptions} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

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
