import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, TrendingUp, DollarSign, Calendar, Info, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  riskTreatment: any;
  annualizedLossExpectancy: any;
}

interface ActionDetail {
  title: string;
  description: string;
  implementation: string;
  riskReduction: string;
  roiAnalysis: string;
  timeline: string;
}

export default function RecommendationsTab() {
  const [data, setData] = useState<FAIRData | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch('/fair-data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const actionDetails: Record<string, ActionDetail> = {
    mfa: {
      title: "Deploy Phishing-Resistant MFA (FIDO2) for Privileged Accounts",
      description: "Replace legacy TOTP-based MFA with phishing-resistant FIDO2 hardware keys for all privileged AWS accounts and administrative access",
      implementation: "Procure 500 YubiKey 5 NFC hardware tokens ($25K). Deploy Duo Security FIDO2 integration ($50K setup + $15K/year licensing). Enforce FIDO2-only authentication for: AWS root accounts, IAM admin users, HeliosAI production access, database admin consoles, and VPN privileged access. Disable TOTP fallback for these accounts. Timeline: 6-8 weeks for procurement, deployment, and user enrollment.",
      riskReduction: "Reduces Vulnerability from 29% to 22% by eliminating the primary attack vector (credential phishing). Iron Vortex's spear-phishing campaigns (85th percentile capability) become ineffective against FIDO2-protected accounts. This single control addresses the #1 identified gap in Hyperion's defenses. Expected LEF reduction: 1.16 → 0.88 events/year (24% reduction).",
      roiAnalysis: "Investment: $90K. Annual ALE reduction: $565M (from $2.03B to $1.47B). First-year ROI: 6,278×. Even accounting for implementation effort (200 hours @ $200/hour = $40K), total investment of $130K yields 4,346× ROI. This is the highest-leverage control in the entire risk treatment program.",
      timeline: "Weeks 1-2: Procurement and vendor setup. Weeks 3-4: Pilot deployment with 50 privileged users. Weeks 5-6: Full rollout to all 500 privileged accounts. Weeks 7-8: Disable TOTP fallback and enforce FIDO2-only policy."
    },
    training: {
      title: "Enhanced Security Awareness Training with Vishing Simulations",
      description: "Update security awareness program with current threat intelligence on Iron Vortex TTPs and add voice phishing (vishing) simulations",
      implementation: "Partner with KnowBe4 or Proofpoint for updated training content ($150K/year). Develop custom modules on: genomic data sensitivity, Iron Vortex-specific TTPs, AWS privilege escalation risks, and data exfiltration indicators. Launch monthly vishing simulation campaigns targeting 2,400 employees. Mandatory quarterly refresher training. Implement tiered response: 1st failure = remedial training, 2nd failure = manager notification, 3rd failure = access review.",
      riskReduction: "Reduces Probability of Action (user susceptibility to phishing) from 70% to 60%. While FIDO2 prevents credential theft, social engineering remains a vector for initial access and reconnaissance. Enhanced training reduces the likelihood that employees will provide sensitive information or click malicious links. Expected TEF reduction: 4.2 → 3.6 attempts/year (14% reduction).",
      roiAnalysis: "Investment: $200K (Year 1 setup + licensing). Annual ALE reduction: $280M. First-year ROI: 1,400×. Training is a foundational control that compounds with technical controls - it makes FIDO2 more effective by reducing the attack surface before technical controls are even tested.",
      timeline: "Month 1: Vendor selection and content development. Month 2: Pilot training with 200 users. Month 3: Full rollout to all 2,400 employees. Ongoing: Monthly vishing campaigns and quarterly refreshers."
    },
    iam: {
      title: "Tighten Cross-Region IAM Policies",
      description: "Implement least-privilege IAM policies to prevent lateral movement across AWS regions",
      implementation: "Conduct IAM policy audit using AWS Access Analyzer and Prowler ($50K consulting). Implement region-scoped IAM policies: us-east-1 users cannot access eu-west-1 resources without explicit MFA re-authentication. Deploy AWS Organizations Service Control Policies (SCPs) to enforce region boundaries. Implement just-in-time (JIT) access for cross-region operations using AWS SSO + Okta Workflows ($100K setup). Reduce standing cross-region permissions by 80%.",
      riskReduction: "Reduces Loss Magnitude by limiting blast radius. If Iron Vortex compromises one region, they cannot automatically pivot to all 15 regions. Estimated reduction in records at risk: 130M → 40M (single-region exposure). This reduces regulatory fines (calculated per-record) by 70% and customer churn by 60%. Expected LM reduction: $1.74B → $1.05B (40% reduction).",
      roiAnalysis: "Investment: $150K. Annual ALE reduction: $800M (primarily through reduced loss magnitude). First-year ROI: 5,333×. This control has the highest impact on loss magnitude of any immediate action. It doesn't prevent the breach but dramatically limits the damage.",
      timeline: "Month 1: IAM audit and policy design. Month 2: Pilot region-scoped policies in dev/test environments. Month 3: Production rollout with JIT access workflows. Ongoing: Quarterly IAM policy reviews."
    },
    vendor: {
      title: "Restrict TestSure Vendor Access",
      description: "Implement strict access controls and monitoring for third-party QA vendor TestSure",
      implementation: "Migrate TestSure access from standing VPN credentials to time-bound AWS IAM roles with session duration limits (4 hours max). Implement dedicated VPC for TestSure with network segmentation - no direct access to production genomic databases. Deploy real-time monitoring of TestSure activity using AWS CloudTrail + Splunk SIEM ($100K setup + $50K/year). Require TestSure to implement phishing-resistant MFA for their employees accessing Hyperion systems. Quarterly third-party security assessments ($50K/year).",
      riskReduction: "Reduces Threat Event Frequency by closing the third-party attack vector. Iron Vortex has demonstrated capability to compromise supply chains (similar to SolarWinds-style attacks). TestSure represents an unmonitored backdoor into Hyperion's environment. Restricting and monitoring this access reduces the probability that Iron Vortex can use TestSure as an initial access vector. Expected TEF reduction: 4.2 → 3.8 attempts/year (10% reduction).",
      roiAnalysis: "Investment: $250K (Year 1 setup + ongoing assessments). Annual ALE reduction: $380M. First-year ROI: 1,520×. Third-party risk is often overlooked but represents a significant attack surface. This control also provides compliance benefits for HIPAA Business Associate Agreement (BAA) requirements.",
      timeline: "Month 1: Design dedicated VPC and IAM role architecture. Month 2: Deploy monitoring and migrate TestSure to new access model. Month 3: Conduct first third-party security assessment and enforce MFA requirement. Ongoing: Quarterly assessments and continuous monitoring."
    },
    soc: {
      title: "Implement 24/7 Security Operations Center (SOC)",
      description: "Establish round-the-clock threat detection and incident response capability",
      implementation: "Build hybrid SOC model: Tier 1/2 outsourced to Arctic Wolf or Expel ($500K/year), Tier 3 in-house (hire 3 senior analysts @ $150K each = $450K/year). Deploy advanced threat detection: CrowdStrike Falcon EDR ($200K/year), Vectra NDR for AWS ($150K/year), and Wiz for cloud security posture management ($100K/year). Integrate with existing Splunk SIEM. Establish 15-minute mean time to detect (MTTD) and 1-hour mean time to respond (MTTR) SLAs.",
      riskReduction: "Reduces Loss Event Frequency by improving detection of Iron Vortex's multi-stage attack. Currently, Hyperion's detection capability is limited - attacks could progress for days before discovery. 24/7 SOC with advanced tooling detects lateral movement, data exfiltration, and ransomware deployment in real-time, enabling response before full compromise. Expected Vulnerability reduction: 29% → 18% (38% reduction in successful attack completion).",
      roiAnalysis: "Investment: $1.4M/year (ongoing operational cost). Annual ALE reduction: $750M. First-year ROI: 536×. While expensive, SOC provides continuous risk reduction and is a foundational security capability. It also enables faster recovery (reducing productivity loss and response costs) if a breach does occur.",
      timeline: "Months 1-2: Vendor selection and tool procurement. Months 3-4: SOC buildout and analyst hiring. Months 5-6: Integration, playbook development, and tabletop exercises. Month 7+: Full operational capability with continuous improvement."
    },
    drp: {
      title: "Enhanced Disaster Recovery and Backup Hardening",
      description: "Implement immutable backups and improve recovery time objectives (RTO)",
      implementation: "Deploy AWS Backup with immutable snapshots (WORM compliance mode) for all genomic databases ($100K/year storage costs). Implement 3-2-1 backup strategy: 3 copies, 2 different media types, 1 offsite (AWS S3 Glacier + on-premises tape library). Harden backup infrastructure: separate AWS account with no cross-account access, MFA delete enabled, 90-day retention lock. Conduct quarterly disaster recovery drills to validate 24-hour RTO for full platform restoration.",
      riskReduction: "Reduces Loss Magnitude by enabling rapid recovery without ransom payment. Currently, if Iron Vortex deploys ransomware, Hyperion faces a binary choice: pay ransom or face extended downtime. Immutable backups eliminate ransom payment pressure and reduce productivity loss (24-hour recovery vs. 3-4 week rebuild). Expected LM reduction: $1.74B → $1.52B (13% reduction, primarily in productivity loss and response costs).",
      roiAnalysis: "Investment: $300K (Year 1 setup + storage). Annual ALE reduction: $250M. First-year ROI: 833×. This control also provides business continuity benefits beyond cybersecurity (protection against accidental deletion, natural disasters, etc.).",
      timeline: "Month 1: Design backup architecture and procure storage. Month 2: Deploy immutable backup solution in pilot region. Month 3: Full rollout across all 15 AWS regions. Month 4+: Quarterly DR drills and continuous validation."
    },
    zeroTrust: {
      title: "Zero Trust Network Architecture (ZTNA)",
      description: "Implement zero trust principles with micro-segmentation and continuous verification",
      implementation: "Deploy Zscaler Private Access or Palo Alto Prisma Access for zero trust network access ($400K/year). Implement micro-segmentation: every application, database, and service requires explicit authentication and authorization - no implicit trust based on network location. Deploy continuous verification: re-authenticate every 4 hours, verify device posture (patch level, EDR status) before granting access. Eliminate VPN in favor of ZTNA for all remote access.",
      riskReduction: "Reduces Vulnerability by preventing lateral movement even after initial compromise. Iron Vortex's attack chain relies on moving from initial access (phishing) to privilege escalation to lateral movement across regions. ZTNA breaks this chain - even if they compromise one user account, they cannot pivot to other systems without re-authenticating and passing device posture checks. Expected Vulnerability reduction: 29% → 15% (48% reduction).",
      roiAnalysis: "Investment: $600K (Year 1 setup + licensing). Annual ALE reduction: $580M. First-year ROI: 967×. ZTNA is a long-term architectural shift that provides compounding benefits - it makes all other controls more effective by enforcing least-privilege access at the network layer.",
      timeline: "Months 1-3: Architecture design and pilot deployment. Months 4-6: Phased rollout to production applications. Months 7-9: VPN decommissioning and full ZTNA enforcement. Months 10-12: Optimization and fine-tuning."
    }
  };

  const handleActionClick = (actionKey: string) => {
    setSelectedAction(actionDetails[actionKey]);
    setDialogOpen(true);
  };

  const ActionCard = ({
    id,
    title,
    delay = 0
  }: {
    id: string;
    title: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: 4 }}
      onClick={() => handleActionClick(id)}
      className="cursor-pointer"
    >
      <div className="flex items-start gap-3 p-4 rounded-lg border border-muted/50 bg-card/50 hover:bg-card/80 hover:border-green-500/50 transition-all duration-300">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
        </div>
        <Info className="h-4 w-4 opacity-50 flex-shrink-0" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-effect border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="h-6 w-6" />
              </div>
              Risk Treatment Program Overview
            </CardTitle>
            <CardDescription className="text-base ml-14">Comprehensive approach to reducing risk to acceptable levels • Click any action for details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="text-sm text-muted-foreground mb-2">Total Investment</div>
                <div className="text-3xl font-bold">
                  <AnimatedCurrency value={data.riskTreatment.totalProgram.investment} duration={2} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="text-sm text-muted-foreground mb-2">ALE Reduction</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  <AnimatedCurrency value={data.riskTreatment.totalProgram.aleReduction} duration={2} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="text-sm text-muted-foreground mb-2">Return on Investment</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {data.riskTreatment.totalProgram.roi}×
                </div>
              </motion.div>
            </div>
            <motion.div
              className="mt-6 p-4 bg-background rounded-lg border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-sm">
                <strong>Residual ALE after full implementation:</strong> {formatCurrency(data.riskTreatment.totalProgram.residualALE)} (90% risk reduction)
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Immediate Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="glass-effect border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  Immediate Actions (0-3 months)
                </CardTitle>
                <CardDescription className="ml-12">Highest priority, fastest ROI</CardDescription>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge variant="destructive" className="text-sm px-3 py-1 shadow-lg shadow-red-500/20">URGENT</Badge>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Investment</div>
                <div className="text-2xl font-bold">
                  <AnimatedCurrency value={data.riskTreatment.immediate.investment} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ALE Reduction</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  <AnimatedCurrency value={data.riskTreatment.immediate.aleReduction} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ROI</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.riskTreatment.immediate.roi}×
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <ActionCard id="mfa" title="Deploy phishing-resistant MFA (FIDO2) for privileged accounts" delay={0.7} />
              <ActionCard id="training" title="Enhanced security awareness training with vishing simulations" delay={0.75} />
              <ActionCard id="iam" title="Tighten cross-region IAM policies" delay={0.8} />
              <ActionCard id="vendor" title="Restrict TestSure vendor access" delay={0.85} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Short-Term Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="glass-effect border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Short-Term Actions (3-12 months)
                </CardTitle>
                <CardDescription className="ml-12">Foundational security improvements</CardDescription>
              </div>
              <Badge variant="outline" className="border-orange-500/50 text-orange-600 bg-orange-500/5">HIGH PRIORITY</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Investment</div>
                <div className="text-2xl font-bold">
                  <AnimatedCurrency value={data.riskTreatment.shortTerm.investment} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ALE Reduction</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  <AnimatedCurrency value={data.riskTreatment.shortTerm.aleReduction} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ROI</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.riskTreatment.shortTerm.roi}×
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <ActionCard id="soc" title="Implement 24/7 Security Operations Center (SOC)" delay={0.95} />
              <ActionCard id="drp" title="Enhanced disaster recovery and backup hardening" delay={1.0} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Long-Term Actions */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.6 }}
      >
        <Card className="glass-effect border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Long-Term Actions (12+ months)
                </CardTitle>
                <CardDescription className="ml-12">Strategic architectural improvements</CardDescription>
              </div>
              <Badge variant="outline" className="border-blue-500/50 text-blue-600 bg-blue-500/5">STRATEGIC</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Investment</div>
                <div className="text-2xl font-bold">
                  <AnimatedCurrency value={data.riskTreatment.longTerm.investment} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ALE Reduction</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  <AnimatedCurrency value={data.riskTreatment.longTerm.aleReduction} duration={2} />
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">ROI</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.riskTreatment.longTerm.roi}×
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <ActionCard id="zeroTrust" title="Zero Trust Network Architecture (ZTNA)" delay={1.1} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Acceptance Decision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Card className="glass-effect border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Risk Acceptance Decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              <strong>Recommendation: Risk acceptance is NOT recommended.</strong> The current ALE of {formatCurrency(data.annualizedLossExpectancy.mostLikely)} represents 84% of annual revenue and poses an existential threat to Hyperion Genomics. Even the minimum ALE estimate ({formatCurrency(data.annualizedLossExpectancy.min)}) would severely impact organizational viability.
            </p>
            <p className="text-sm leading-relaxed mt-4">
              The organization should immediately initiate the risk treatment program, beginning with the Immediate Actions phase. The extraordinary ROI ({data.riskTreatment.immediate.roi}× for immediate actions) demonstrates that risk treatment is not only necessary but also highly cost-effective. Delaying action increases the probability of breach occurrence and compounds the potential impact.
            </p>
            <p className="text-sm leading-relaxed mt-4">
              <strong>Board-level approval required</strong> for the {formatCurrency(data.riskTreatment.totalProgram.investment)} total program investment. However, the immediate actions ({formatCurrency(data.riskTreatment.immediate.investment)}) can and should be authorized within the CISO's existing budget authority given the critical nature of the risk.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedAction && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAction.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedAction.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Implementation Details
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedAction.implementation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Risk Reduction Mechanism
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedAction.riskReduction}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    ROI Analysis
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedAction.roiAnalysis}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Implementation Timeline
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedAction.timeline}
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
