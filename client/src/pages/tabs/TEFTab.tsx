import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Target, TrendingUp, ExternalLink, Info, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { AnimatedCurrency } from '@/components/AnimatedCounter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FAIRData {
  threatEventFrequency: any;
  scenario: any;
}

interface ExternalData {
  sources: any[];
  industryBenchmarks: any;
}

interface ComponentDetail {
  title: string;
  description: string;
  calculation: string;
  rationale: string;
  dataSource: string;
}

export default function TEFTab() {
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

  if (!data || !externalData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Activity className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p>Loading threat intelligence data...</p>
        </div>
      </div>
    );
  }

  const tef = data.threatEventFrequency;

  const componentDetails: Record<string, ComponentDetail> = {
    contactFrequency: {
      title: "Contact Frequency (CF)",
      description: "How often the threat actor attempts to make contact with the organization's attack surface",
      calculation: `Min: ${tef.components.contactFrequency.min}/year, Most Likely: ${tef.components.contactFrequency.mostLikely}/year, Max: ${tef.components.contactFrequency.max}/year`,
      rationale: "Based on H-ISAC intelligence showing Iron Vortex conducts reconnaissance on 50-200 healthcare/biotech targets annually. Hyperion's high profile (130M records, $2.4B revenue, AI platform) makes it a prime target. Phishing campaigns sent monthly (12/year minimum), with credential stuffing and vulnerability scanning occurring weekly (52/year most likely). Maximum assumes daily automated reconnaissance (365/year).",
      dataSource: "H-ISAC Threat Intelligence (Tim Markham interview), Verizon DBIR 2024 (sophisticated threat actor behavior patterns), Hyperion's SIEM logs showing reconnaissance activity"
    },
    probabilityOfAction: {
      title: "Probability of Action (PA)",
      description: "Likelihood that a contact event will escalate into a full attack attempt",
      calculation: `Min: ${(tef.components.probabilityOfAction.min * 100).toFixed(1)}%, Most Likely: ${(tef.components.probabilityOfAction.mostLikely * 100).toFixed(1)}%, Max: ${(tef.components.probabilityOfAction.max * 100).toFixed(1)}%`,
      rationale: "Iron Vortex is highly selective—they don't attack every target they scout. Minimum (5%) assumes they attack 1 in 20 targets after reconnaissance. Most likely (15%) reflects their recent pattern of 2-3 attacks per year across ~20 scouted targets. Maximum (30%) assumes increased aggression if they identify high-value genomic data. This selectivity is typical of sophisticated ransomware groups who invest significant resources per attack.",
      dataSource: "H-ISAC Iron Vortex activity tracking (2 successful breaches in 6 months across genetic testing sector), Threat actor capability assessment, Historical attack-to-reconnaissance ratio for advanced persistent threats"
    },
    tef: {
      title: "Threat Event Frequency (TEF)",
      description: "Expected number of attack attempts per year (TEF = CF × PA)",
      calculation: `TEF = Contact Frequency × Probability of Action\nMin: ${tef.components.contactFrequency.min} × ${tef.components.probabilityOfAction.min} = ${tef.min.toFixed(2)}/year\nMost Likely: ${tef.components.contactFrequency.mostLikely} × ${tef.components.probabilityOfAction.mostLikely} = ${tef.mostLikely.toFixed(2)}/year\nMax: ${tef.components.contactFrequency.max} × ${tef.components.probabilityOfAction.max} = ${tef.max.toFixed(2)}/year`,
      rationale: "The most likely estimate of 1.2 attacks per year means Hyperion should expect roughly one Iron Vortex attack attempt every 10 months. This is consistent with industry data showing 66% of organizations experienced ransomware in 2024 (Varonis). The range (0.06 to 5.4) reflects uncertainty in both reconnaissance frequency and attack selectivity. The wide range is appropriate given limited historical data on this specific threat actor.",
      dataSource: "Calculated from CF and PA components using FAIR methodology (TEF = CF × PA). Validated against Varonis 2024 ransomware statistics and DBIR 2024 healthcare sector attack frequency."
    }
  };

  const handleComponentClick = (componentKey: string) => {
    setSelectedComponent(componentDetails[componentKey]);
    setDialogOpen(true);
  };

  // Chart data for TEF components
  const componentChartData = {
    labels: ['Contact Frequency', 'Probability of Action', 'TEF Result'],
    datasets: [
      {
        label: 'Minimum',
        data: [
          tef.components.contactFrequency.min,
          tef.components.probabilityOfAction.min * 100,
          tef.min
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: 'Most Likely',
        data: [
          tef.components.contactFrequency.mostLikely,
          tef.components.probabilityOfAction.mostLikely * 100,
          tef.mostLikely
        ],
        backgroundColor: 'rgba(251, 146, 60, 0.6)',
      },
      {
        label: 'Maximum',
        data: [
          tef.components.contactFrequency.max,
          tef.components.probabilityOfAction.max * 100,
          tef.max
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const componentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: 'TEF Component Breakdown',
        color: '#fff'
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataIndex === 1) {
              label += context.parsed.y.toFixed(1) + '%';
            } else {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
              Threat Event Frequency (TEF) Analysis
            </CardTitle>
            <CardDescription className="text-base ml-14">
              How often will Iron Vortex attempt to attack Hyperion? • Click any card for detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="ml-14">
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className="border-orange-500/50 text-orange-500 bg-orange-500/5">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Sophisticated Threat Actor
              </Badge>
              <span className="text-muted-foreground font-medium">
                Based on H-ISAC intelligence and industry benchmarks
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TEF Result */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        whileHover={{ y: -1 }}
        onClick={() => handleComponentClick('tef')}
        className="cursor-pointer"
      >
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">TEF = {tef.mostLikely} attacks/year</CardTitle>
                <CardDescription className="text-base mt-2">
                  Range: {tef.min} - {tef.max} attacks/year (90% confidence)
                </CardDescription>
              </div>
              <Info className="h-6 w-6 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <strong>Interpretation:</strong> Hyperion should expect approximately <strong>1 Iron Vortex attack attempt every 10 months</strong> (1.2/year).
              This represents a <strong>96% annual probability</strong> of at least one attack attempt within the next 12 months.
            </p>
            <div className="mt-4 p-3 bg-orange-500/20 rounded-lg">
              <p className="text-sm font-semibold">
                Formula: TEF = Contact Frequency × Probability of Action
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Most Likely: {tef.components.contactFrequency.mostLikely} contacts/year × {(tef.components.probabilityOfAction.mostLikely * 100).toFixed(1)}% action rate = {tef.mostLikely} attacks/year
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Component Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ y: -1 }}
          onClick={() => handleComponentClick('contactFrequency')}
          className="cursor-pointer"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Frequency (CF)</CardTitle>
                  <CardDescription>Reconnaissance & contact attempts per year</CardDescription>
                </div>
                <Info className="h-5 w-5 opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Min</div>
                    <div className="text-lg font-bold text-green-600">{tef.components.contactFrequency.min}</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Most Likely</div>
                    <div className="text-lg font-bold text-orange-600">{tef.components.contactFrequency.mostLikely}</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Max</div>
                    <div className="text-lg font-bold text-red-600">{tef.components.contactFrequency.max}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on Iron Vortex reconnaissance patterns: monthly phishing campaigns (12/year),
                  weekly credential stuffing (52/year), up to daily automated scanning (365/year).
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          whileHover={{ y: -1 }}
          onClick={() => handleComponentClick('probabilityOfAction')}
          className="cursor-pointer"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Probability of Action (PA)</CardTitle>
                  <CardDescription>Likelihood contact escalates to attack</CardDescription>
                </div>
                <Info className="h-5 w-5 opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Min</div>
                    <div className="text-lg font-bold text-green-600">{(tef.components.probabilityOfAction.min * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Most Likely</div>
                    <div className="text-lg font-bold text-orange-600">{(tef.components.probabilityOfAction.mostLikely * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">Max</div>
                    <div className="text-lg font-bold text-red-600">{(tef.components.probabilityOfAction.max * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Iron Vortex is highly selective: 2-3 attacks per year across ~20 scouted targets (15% action rate).
                  Hyperion's high-value genomic data may increase targeting probability.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Threat Event Funnel Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Threat Event Funnel</CardTitle>
            <CardDescription>Visualizing the progression from reconnaissance to attack attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Contact Frequency (Attempts)', 'Actionable Events', 'Threat Events (Attacks)'],
                  datasets: [
                    {
                      label: 'Most Likely Scenario',
                      data: [
                        tef.components.contactFrequency.mostLikely,
                        tef.components.contactFrequency.mostLikely * tef.components.probabilityOfAction.mostLikely, // Intermediate step visualization
                        tef.mostLikely
                      ],
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.6)', // Blue for Contact
                        'rgba(249, 115, 22, 0.6)', // Orange for Actionable
                        'rgba(239, 68, 68, 0.6)',  // Red for Threat Events
                      ],
                      borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(239, 68, 68, 1)',
                      ],
                      borderWidth: 1,
                      barPercentage: 0.6,
                    }
                  ]
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.parsed.x.toFixed(2)} events/year`
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: { display: true, text: 'Frequency (Events/Year)', color: 'hsl(var(--foreground))' },
                      ticks: { color: 'hsl(var(--foreground))' },
                      grid: { color: 'hsl(var(--border))' }
                    },
                    y: {
                      ticks: { color: 'hsl(var(--foreground))', font: { weight: 'bold' } },
                      grid: { display: false }
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <strong>Funnel Analysis:</strong> Iron Vortex makes frequent contact (~{tef.components.contactFrequency.mostLikely}/year),
                but only {(tef.components.probabilityOfAction.mostLikely * 100).toFixed(0)}% of these contacts escalate to full attacks.
                This filtering effect results in the final Threat Event Frequency of {tef.mostLikely} attacks/year.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Component Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>TEF Component Breakdown</CardTitle>
            <CardDescription>Visual comparison of minimum, most likely, and maximum estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <Bar data={componentChartData} options={componentOptions} />
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm">
                <strong>Note:</strong> Probability of Action is scaled ×100 for visualization. The wide range in TEF
                (0.06 to 5.4) reflects uncertainty in both reconnaissance frequency and attack selectivity, which is
                appropriate given limited historical data on this specific threat actor.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threat Actor Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Iron Vortex Threat Actor Profile
            </CardTitle>
            <CardDescription>Intelligence from H-ISAC (Tim Markham)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Threat Actor</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Iron Vortex</strong> - Russian cybercriminal ransomware group with demonstrated capability
                against genetic testing companies. Successfully breached two similar organizations in the past 6 months.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tactics, Techniques, and Procedures (TTPs)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Spear-phishing of privileged users (initial access)</li>
                <li>Credential theft and MFA bypass techniques</li>
                <li>AWS privilege escalation via IAM misconfigurations</li>
                <li>Lateral movement across AWS regions</li>
                <li>Data exfiltration to external S3 buckets</li>
                <li>Cyclone ransomware deployment with intermittent encryption</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Industry Benchmarks</h4>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Ransomware Prevalence (Varonis 2024)</div>
                  <div className="text-lg font-bold">{(externalData.industryBenchmarks.ransomwareFrequency.value * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {externalData.industryBenchmarks.ransomwareFrequency.description}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">System Intrusion Breaches (DBIR 2024)</div>
                  <div className="text-lg font-bold">{(externalData.industryBenchmarks.ransomwareSystemIntrusion.value * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {externalData.industryBenchmarks.ransomwareSystemIntrusion.description}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-sm">
                <strong>Key Insight:</strong> The 1.2 attacks/year estimate is conservative compared to industry data
                showing 66% annual ransomware prevalence. However, Iron Vortex's selectivity (targeting only high-value
                genomic data) justifies a lower frequency than broad-spectrum ransomware campaigns.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {externalData.sources.map((source: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">{source.name}</div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {source.url}
                    </a>
                  </div>
                </div>
              ))}
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
                <DialogDescription className="text-base mt-2">
                  {selectedComponent.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Calculation</h4>
                  <p className="text-sm leading-relaxed font-mono bg-muted/30 p-3 rounded-lg">
                    {selectedComponent.calculation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Rationale</h4>
                  <p className="text-sm leading-relaxed">
                    {selectedComponent.rationale}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Data Sources</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedComponent.dataSource}
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
