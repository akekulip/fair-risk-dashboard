import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, TrendingUp, AlertTriangle, BarChart3, Target, Settings, FileText, Lightbulb, Calculator } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface DashboardLayoutProps {
  children?: ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

import { useExport } from '@/hooks/useExport';
import { Download } from 'lucide-react';

export default function DashboardLayout({ children, activeTab = 'summary', onTabChange }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { exportToPDF } = useExport();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 no-print">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FAIR Risk Analysis</h1>
                <p className="text-sm text-muted-foreground">Hyperion Genomics - Iron Vortex Threat Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToPDF('dashboard-content', 'fair-risk-report')}
                data-export-trigger="true"
                className="gap-2 hidden md:flex"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="dashboard-content" className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 h-auto p-1 bg-muted/50">
            <TabsTrigger value="summary" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="fair-model" className="flex items-center gap-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">FAIR Model</span>
            </TabsTrigger>
            <TabsTrigger value="loss-curves" className="flex items-center gap-2 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Loss Curves</span>
            </TabsTrigger>
            <TabsTrigger value="tef" className="flex items-center gap-2 py-3">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">TEF</span>
            </TabsTrigger>
            <TabsTrigger value="vulnerability" className="flex items-center gap-2 py-3">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Vulnerability</span>
            </TabsTrigger>
            <TabsTrigger value="loss-magnitude" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Loss Magnitude</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="whatif" className="flex items-center gap-2 py-3">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">What-If</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 py-3">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 FAIR Risk Analysis Dashboard | Confidential - Board Level</p>
            <p>Analysis Date: November 7, 2025 | Time Horizon: 12 months</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
