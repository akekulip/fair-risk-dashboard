# FAIR Risk Dashboard - TODO

## Features to Implement

- [x] Dashboard layout with multi-tab navigation
- [x] Tab 1: Executive Summary with key risk metrics
- [x] Tab 2: FAIR Model Visualization (interactive layered diagram)
- [x] Tab 3: Loss Exceedance Curves (interactive chart)
- [ ] Tab 4: Threat Event Frequency Analysis
- [ ] Tab 5: Susceptibility & Control Assessment
- [ ] Tab 6: Loss Magnitude Breakdown
- [ ] Tab 7: Monte Carlo Simulation Results
- [x] Tab 8: Risk Treatment Recommendations
- [x] Interactive charts using Chart.js
- [x] Responsive design for mobile and desktop
- [x] Data visualization for FAIR components
- [x] Loss distribution histograms
- [x] Percentile analysis charts
- [ ] Export functionality for reports
- [x] Dark/light theme toggle
- [x] Professional color scheme matching FAIR Institute branding

## Design Elements

- [x] Hero section with scenario overview
- [x] Card-based layout for metrics
- [x] Interactive FAIR model diagram
- [x] Animated transitions between tabs
- [ ] Tooltips for technical terms
- [x] Gradient backgrounds and modern styling
- [x] Icon integration (lucide-react)

## Data Integration

- [x] Load FAIR analysis data from JSON
- [x] Calculate Monte Carlo distributions
- [x] Generate loss exceedance curves
- [x] Compute percentiles (10th, 50th, 90th)
- [x] Format currency and percentages
- [x] Create data summary tables

## Technical Implementation

- [x] Set up routing for multi-page navigation
- [x] Implement Chart.js for visualizations
- [x] Create reusable chart components
- [ ] Add animation libraries (framer-motion)
- [x] Optimize performance for large datasets
- [ ] Ensure accessibility compliance


## New Requirements

- [x] Complete TEF Analysis tab with detailed breakdown
- [x] Complete Vulnerability/Susceptibility tab with control assessment
- [x] Complete Loss Magnitude tab with component breakdown charts
- [x] Complete Monte Carlo Simulation tab with distribution visualizations
- [x] Enhance FAIR Model visualization with better hierarchy and aesthetics
- [x] Integrate external data sources (Verizon DBIR, IBM Cost of Breach)
- [x] Add clear attribution for external data sources
- [x] Improve overall visual design and aesthetics

## Bug Fixes

- [x] Fix Chart.js ArcElement registration error in LossMagnitudeTab (Pie chart)
- [x] Fix Chart.js ArcElement registration error in TEFTab (if using Pie chart)
- [x] Fix React Hooks rule violation in SimulationTab (hooks called after early return)

## Comprehensive Review & Enhancement

- [x] Verify all FAIR calculations are mathematically correct
- [x] Check data consistency across all tabs
- [ ] Validate Loss Exceedance Curve calculations
- [ ] Add interactive hover tooltips to all charts
- [ ] Add interactive elements to FAIR Model diagram
- [ ] Implement risk level indicators with color coding
- [ ] Add animated transitions for better visual communication
- [ ] Create interactive risk comparison sliders
- [ ] Add drill-down capabilities for detailed analysis
- [ ] Implement data point highlighting across related charts
- [x] Add chart animation on load for all visualizations
- [x] Implement animated FAIR model with data flow visualization
- [ ] Add smooth transitions between tabs
- [x] Create animated metric counters for key numbers
- [x] Add hover animations and tooltips to all interactive elements
- [x] Implement animated risk level indicators
- [x] Add pulse animations to critical alerts

## FAIR Model Hierarchy Fix

- [x] Restructure FAIR Model to follow standard FAIR taxonomy hierarchy
- [x] Add triple-click functionality to show detailed explanations in modals
- [x] Create modal dialogs for each FAIR component with formulas and rationale
- [x] Ensure proper visual flow from Risk → LEF/LM → TEF/Vuln/Primary/Secondary → sub-components
- [x] Add click-to-detail modals for all metric cards in Summary tab
- [ ] Add click-to-detail modals for all charts in other tabs
- [x] Create comprehensive explanation content for each metric
- [x] Fix React ref warning in Dialog component (DialogOverlay forwardRef issue)

## Animation and Interactivity Enhancements

- [x] Add animations to Loss Magnitude tab (cards, charts)
- [x] Add click-to-expand modals for Loss Magnitude components
- [x] Add animations to Simulation tab (charts, distributions)
- [x] Add click-to-expand modals for Simulation charts
- [x] Add animations to Actions/Recommendations tab
- [x] Add click-to-expand modals for each recommendation with detailed ROI analysis
- [x] Fix undefined property error in Loss Magnitude tab (externalData.industryBenchmarks access)

## Additional Animation Enhancements

- [x] Add animations to Loss Curves tab (charts, cards)
- [x] Add click-to-expand modals for Loss Curves charts with methodology
- [x] Add animations to TEF tab (charts, threat intelligence cards)
- [x] Add click-to-expand modals for TEF components
- [x] Add animations to Vulnerability tab (control assessment cards, charts)
- [x] Add click-to-expand modals for Vulnerability components

## What-If Analysis Feature

- [x] Create What-If Analysis tab component
- [x] Add interactive sliders for MFA coverage (0-100%)
- [x] Add interactive sliders for security training effectiveness (0-100%)
- [x] Add interactive sliders for IAM tightening (0-100%)
- [x] Add interactive sliders for third-party risk controls (0-100%)
- [x] Implement real-time recalculation of Vulnerability/Susceptibility
- [x] Implement real-time recalculation of LEF
- [x] Implement real-time recalculation of ALE
- [x] Create before/after comparison charts
- [x] Add ROI calculation display
- [x] Add investment cost estimation
- [x] Integrate What-If tab into main navigation

## Accessibility Fixes

- [x] Add DialogTitle to all Dialog components for screen reader accessibility

## FAIR Model Visualization Redesign

- [x] Redesign FAIR Model to match official FAIR Institute workbook layout
- [x] Add Min/Average/Max input boxes for each component
- [x] Add Confidence level display for each component
- [x] Implement clickable boxes that open detailed modal dialogs
- [x] Add visual hierarchy with colored boxes (orange for LEF, green for Primary Loss, etc.)
- [x] Include Monte Carlo simulation note in each box
- [x] Add connecting lines/arrows between components

## FAIR Model Fixes

- [x] Add Secondary Loss Event Frequency (SLEF) component
- [x] Add Secondary Loss Magnitude (SLM) component  
- [x] Fix hover effect causing cards to vanish
- [x] Ensure proper hierarchy: SL → SLEF + SLM
- [x] Add proper confidence levels based on data source quality (High/Medium/Low)

## Secondary Loss Magnitude Sub-Components

- [x] Add Response Cost (RespC) component under SLM
- [x] Add Competitive Advantage Loss (CAdvL) component under SLM
- [x] Add Fines & Judgments (FinJu) component under SLM
- [x] Add Reputation Damage component under SLM
- [x] Update FAIR diagram to show SLM → RespC + CAdvL + FinJu + Reputation hierarchy

## Primary Loss Sub-Components

- [x] Add Productivity Loss (ProdL) component under Primary Loss
- [x] Add Response Cost (RespC) component under Primary Loss  
- [x] Add Replacement Cost (ReplC) component under Primary Loss
- [x] Update FAIR diagram to show PL → ProdL + RespC + ReplC hierarchy
- [x] Update fair-data.json with Primary Loss sub-component data

## Future Enhancements

- [ ] Add PDF Export functionality with jsPDF for executive reports
- [ ] Create Scenario Save/Load feature with localStorage
- [ ] Implement keyboard shortcuts (1-9 for tabs, E for export, R to reset, ? for help)
- [ ] Add CSV/Excel export buttons on each tab for underlying data tables
- [ ] Create print-friendly CSS styles for physical report generation
