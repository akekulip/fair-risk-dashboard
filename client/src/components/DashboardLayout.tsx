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
    <div className="min-h-screen bg-background dark:bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background)/0.95)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background)/0.6)] sticky top-0 z-50 no-print">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)]">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FAIR Risk Analysis</h1>
                <p className="text-sm text-muted-foreground">Hyperion Genomics - Iron Vortex Threat Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://akekudaga.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              >
                akekudaga.com
              </a>
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
            <p>Case Study by FAIR Institute | Solution by <a href="https://akekudaga.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">Philip Akekudaga</a></p>
            <p>Analysis Date: November 7, 2025 | Time Horizon: 12 months</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
