# FAIR Risk Analysis Dashboard

**Case Study by FAIR Institute | Solution by [Philip Akekudaga](https://akekudaga.com)**

A comprehensive, interactive dashboard for visualizing and analyzing cybersecurity risk using the FAIR (Factor Analysis of Information Risk) model. This dashboard was built as a solution to the "Iron Vortex" threat assessment case study for Hyperion Genomics.

## Features

-   **Interactive FAIR Model**: Explore the relationships between risk factors.
-   **Monte Carlo Simulation**: Run simulations to estimate Loss Event Frequency (LEF) and Annualized Loss Expectancy (ALE).
-   **Defense & Attack Path Analysis**: Visualize the attack chain and control failures with multi-level detail (Summary, Technical, Simulation).
-   **What-If Analysis**: Compare current risk against potential future scenarios.
-   **Threat Event Funnel (TEF)**: Analyze the progression of threat events.
-   **Loss Magnitude Analysis**: Deep dive into primary and secondary loss forms.
-   **Actionable Recommendations**: Prioritized list of risk reduction activities.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, Framer Motion
-   **Charts**: Chart.js, React-Chartjs-2
-   **Icons**: Lucide React
-   **UI Components**: Radix UI (via shadcn/ui patterns)

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/fair-risk-dashboard.git
    cd fair-risk-dashboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard in your browser.

## License

This project is a portfolio piece and solution to a case study.
