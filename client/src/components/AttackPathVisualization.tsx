import { motion } from 'framer-motion';
import { Shield, AlertCircle, ArrowRight, Lock, Unlock, Skull, Database, Server, User, MousePointerClick, Info, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMultiClick } from '@/hooks/useMultiClick';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttackStage {
    id: string;
    name: string;
    icon: any;
    threatAction: string;
    controlFailure: string;
    status: 'critical' | 'warning' | 'failed';
    description: string;
    technicalDetails: string;
    simulationContext: string;
}

const attackPath: AttackStage[] = [
    {
        id: 'recon',
        name: 'Reconnaissance',
        icon: User,
        threatAction: 'Spear-Phishing Campaigns',
        controlFailure: 'Security Awareness Gaps',
        status: 'failed',
        description: 'Iron Vortex identifies key personnel via LinkedIn. Phishing emails bypass filters; users click malicious links due to lack of recent training.',
        technicalDetails: 'Technique: T1598 (Phishing for Information). CVE-2023-XXXX (Hypothetical Outlook Bypass). Payload: Malicious link to credential harvester.',
        simulationContext: 'Simulation #42: 85% success rate with current awareness training levels. Increasing training frequency reduces success to 45%.'
    },
    {
        id: 'access',
        name: 'Initial Access',
        icon: Unlock,
        threatAction: 'Credential Theft',
        controlFailure: 'MFA Coverage Gaps',
        status: 'critical',
        description: 'Attacker harvests credentials from phishing. Logs in to VPN/Cloud. Lack of FIDO2 MFA allows bypass via relay attacks or simple credential reuse.',
        technicalDetails: 'Technique: T1078 (Valid Accounts). MFA Bypass via AiTM (Adversary-in-the-Middle) toolkit. Target: VPN Gateway & O365.',
        simulationContext: 'Simulation #12: 100% success rate against SMS/TOTP MFA. 0% success rate against FIDO2 hardware keys.'
    },
    {
        id: 'escalation',
        name: 'Privilege Escalation',
        icon: Server,
        threatAction: 'Exploit Misconfiguration',
        controlFailure: 'Over-Permissive IAM',
        status: 'critical',
        description: 'Attacker compromises a developer account. Uses over-permissive IAM roles to escalate privileges to Admin/Root level within AWS environment.',
        technicalDetails: 'Technique: T1098 (Account Manipulation). AWS IAM Role assumption. Policy: "AdministratorAccess" attached to Dev role.',
        simulationContext: 'Simulation #08: Automated IAM analysis detected escalation path in 45 minutes. Manual review took 3 days.'
    },
    {
        id: 'lateral',
        name: 'Lateral Movement',
        icon: ArrowRight,
        threatAction: 'Internal Pivot',
        controlFailure: 'Flat Network / No Segmentation',
        status: 'warning',
        description: 'Moves from dev environment to production S3 buckets. Lack of strict network segmentation and internal firewalls allows free movement.',
        technicalDetails: 'Technique: T1021 (Remote Services). Protocol: SSH/RDP. Lateral movement via shared VPC peering.',
        simulationContext: 'Simulation #15: Micro-segmentation blocked 90% of lateral movement attempts. Current flat network allows 100%.'
    },
    {
        id: 'impact',
        name: 'Impact',
        icon: Skull,
        threatAction: 'Data Exfiltration',
        controlFailure: 'No DLP / Egress Filtering',
        status: 'critical',
        description: '130M genomic records exfiltrated to C2 server. Ransomware deployed to encrypt backups and production data.',
        technicalDetails: 'Technique: T1048 (Exfiltration Over Alternative Protocol). Data size: 1.2TB. Protocol: Encrypted HTTPS to unknown IP.',
        simulationContext: 'Simulation #99: DLP blocked exfiltration of PII. Current setup allowed full 1.2TB transfer.'
    }
];

// Sub-component to handle individual stage rendering and hooks
const AttackStageCard = ({ stage, index, onStageClick }: { stage: AttackStage, index: number, onStageClick: (stage: AttackStage, level: 'summary' | 'technical' | 'simulation') => void }) => {
    const handleClick = useMultiClick({
        onSingleClick: () => onStageClick(stage, 'summary'),
        onDoubleClick: () => onStageClick(stage, 'technical'),
        onTripleClick: () => onStageClick(stage, 'simulation'),
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            onClick={handleClick}
            className="cursor-pointer"
        >
            <div className="group relative">
                {/* Stage Card */}
                <Card className={cn(
                    "h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-t-4 select-none",
                    stage.status === 'critical' ? "border-t-red-500 bg-red-500/5 hover:bg-red-500/10" :
                        stage.status === 'warning' ? "border-t-orange-500 bg-orange-500/5 hover:bg-orange-500/10" :
                            "border-t-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10"
                )}>
                    <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className={cn(
                                "p-2 rounded-full",
                                stage.status === 'critical' ? "bg-red-500/20 text-red-500" :
                                    stage.status === 'warning' ? "bg-orange-500/20 text-orange-500" :
                                        "bg-yellow-500/20 text-yellow-500"
                            )}>
                                <stage.icon className="h-5 w-5" />
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">0{index + 1}</div>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-sm">{stage.name}</h3>

                        {/* Threat vs Control */}
                        <div className="space-y-2 text-xs">
                            <div className="flex items-start gap-2">
                                <Skull className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                <span className="text-red-400 font-medium">{stage.threatAction}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Shield className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                <span className="text-muted-foreground">{stage.controlFailure}</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <Badge variant="outline" className={cn(
                            "w-full justify-center text-[10px] uppercase tracking-wider",
                            stage.status === 'critical' ? "border-red-500/50 text-red-500" :
                                stage.status === 'warning' ? "border-orange-500/50 text-orange-500" :
                                    "border-yellow-500/50 text-yellow-500"
                        )}>
                            {stage.status === 'critical' ? 'Critical Failure' : 'Control Gap'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Connector Arrow (Mobile only) */}
                {index < attackPath.length - 1 && (
                    <div className="flex justify-center my-2 md:hidden">
                        <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function AttackPathVisualization() {
    const [selectedStage, setSelectedStage] = useState<AttackStage | null>(null);
    const [detailLevel, setDetailLevel] = useState<'summary' | 'technical' | 'simulation'>('summary');
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleStageClick = (stage: AttackStage, level: 'summary' | 'technical' | 'simulation') => {
        setSelectedStage(stage);
        setDetailLevel(level);
        setDialogOpen(true);
    };

    return (
        <div className="relative py-8">
            {/* Legend */}
            <div className="absolute top-0 right-0 flex items-center gap-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm z-20">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Critical Failure</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Warning</span>
                </div>
                <div className="flex items-center gap-1">
                    <MousePointerClick className="h-3 w-3" />
                    <span>Click for Details (1x, 2x, 3x)</span>
                </div>
            </div>

            {/* Connecting Line */}


            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {attackPath.map((stage, index) => (
                    <AttackStageCard
                        key={stage.id}
                        stage={stage}
                        index={index}
                        onStageClick={handleStageClick}
                    />
                ))}
            </div>

            {/* Narrative Overlay */}
            <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-muted">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    Attack Narrative
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Iron Vortex exploits the <strong>Human Gap</strong> (Recon) to bypass the perimeter, then leverages the <strong>Identity Gap</strong> (Access) to gain a foothold.
                    Without internal segmentation or effective IAM (<strong>Privilege Gap</strong>), they move laterally to production systems, resulting in the <strong>Impact</strong> of massive data theft.
                </p>
            </div>

            {/* Detail Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedStage && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <selectedStage.icon className="h-6 w-6 text-blue-500" />
                                    {selectedStage.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Stage {attackPath.findIndex(s => s.id === selectedStage.id) + 1} of 5
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue={detailLevel} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="summary">Summary (1x)</TabsTrigger>
                                    <TabsTrigger value="technical">Technical (2x)</TabsTrigger>
                                    <TabsTrigger value="simulation">Simulation (3x)</TabsTrigger>
                                </TabsList>

                                <TabsContent value="summary" className="space-y-4 mt-4">
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Overview
                                        </h4>
                                        <p className="text-sm leading-relaxed">{selectedStage.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded border border-red-200 bg-red-50">
                                            <span className="text-xs font-bold text-red-600 uppercase">Threat Action</span>
                                            <p className="text-sm font-medium text-red-900">{selectedStage.threatAction}</p>
                                        </div>
                                        <div className="p-3 rounded border border-blue-200 bg-blue-50">
                                            <span className="text-xs font-bold text-blue-600 uppercase">Control Failure</span>
                                            <p className="text-sm font-medium text-blue-900">{selectedStage.controlFailure}</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="technical" className="space-y-4 mt-4">
                                    <div className="p-4 rounded-lg bg-slate-950 text-slate-50 font-mono text-sm">
                                        <h4 className="font-semibold mb-2 text-green-400 flex items-center gap-2">
                                            <Server className="h-4 w-4" />
                                            Technical Details
                                        </h4>
                                        <p className="leading-relaxed whitespace-pre-wrap">{selectedStage.technicalDetails}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="simulation" className="space-y-4 mt-4">
                                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                        <h4 className="font-semibold mb-2 text-purple-700 flex items-center gap-2">
                                            <Activity className="h-4 w-4" />
                                            Simulation Context
                                        </h4>
                                        <p className="text-sm text-purple-900 leading-relaxed">{selectedStage.simulationContext}</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
