import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import SummaryTab from './tabs/SummaryTab';
import FAIRModelTab from './tabs/FAIRModelTab';
import LossCurvesTab from './tabs/LossCurvesTab';
import TEFTab from './tabs/TEFTab';
import VulnerabilityTab from './tabs/VulnerabilityTab';
import LossMagnitudeTab from './tabs/LossMagnitudeTab';
import SimulationTab from './tabs/SimulationTab';
import RecommendationsTab from './tabs/RecommendationsTab';
import WhatIfTab from './tabs/WhatIfTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabsContent value="summary" className="mt-0">
        <SummaryTab />
      </TabsContent>
      
      <TabsContent value="fair-model" className="mt-0">
        <FAIRModelTab />
      </TabsContent>
      
      <TabsContent value="loss-curves" className="mt-0">
        <LossCurvesTab />
      </TabsContent>
      
      <TabsContent value="tef" className="mt-0">
        <TEFTab />
      </TabsContent>
      
      <TabsContent value="vulnerability" className="mt-0">
        <VulnerabilityTab />
      </TabsContent>
      
      <TabsContent value="loss-magnitude" className="mt-0">
        <LossMagnitudeTab />
      </TabsContent>
      
      <TabsContent value="simulation" className="mt-0">
        <SimulationTab />
      </TabsContent>
      
      <TabsContent value="whatif" className="mt-0">
        <WhatIfTab />
      </TabsContent>
      
      <TabsContent value="recommendations" className="mt-0">
        <RecommendationsTab />
      </TabsContent>
    </DashboardLayout>
  );
}
