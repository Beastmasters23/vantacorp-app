import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const [brainNodes, linuxNodes, recentTasks] = await Promise.all([
            base44.asServiceRole.entities.VantaBrainNode.list('-last_sync', 50),
            base44.asServiceRole.entities.LinuxNode.list('-last_heartbeat', 20),
            base44.asServiceRole.entities.VantaTask.list('-created_date', 20),
        ]);

        // Use cognitive_domain if specialization is missing
        const orchestrators = brainNodes.filter(n => 
            (n.cognitive_domain === 'orchestrator' || n.specialization === 'orchestrator') && 
            n.status !== 'Offline'
        );

        if (orchestrators.length === 0) {
            console.log('[vantaOrchestratorPulse] No orchestrator — continuing pulse cycle');
            return Response.json({ status: 'ok', message: 'Waiting for orchestrator initialization' });
        }

        const orchestrator = orchestrators[0];
        const now = Date.now();

        const hiveStatus = {
            total_nodes: brainNodes.length,
            active_nodes: brainNodes.filter(n => n.status === 'active' || n.status === 'Ready' || n.status === 'Learning').length,
            offline_nodes: brainNodes.filter(n => n.status === 'Offline').length,
            stale_nodes: brainNodes.filter(n => {
                if (!n.last_sync) return true;
                return (now - new Date(n.last_sync).getTime()) > 600000;
            }).length,
            specializations_present: [...new Set(brainNodes.map(n => n.cognitive_domain || n.specialization))],
            online_linux_nodes: linuxNodes.filter(n => {
                if (n.status !== 'Online' || !n.last_heartbeat) return false;
                return (now - new Date(n.last_heartbeat).getTime()) < 120000;
            }).length,
            recent_task_failures: recentTasks.filter(t => t.status === 'Failed').length,
            recent_task_successes: recentTasks.filter(t => t.status === 'Completed').length,
        };

        const activeNodes = brainNodes.filter(n => n.status === 'active' || n.status === 'Ready' || n.status === 'Learning');
        const avgKnowledge = activeNodes.length > 0
            ? Math.round(activeNodes.reduce((s, n) => s + (n.knowledge_version || 0), 0) / activeNodes.length)
            : 0;
        const avgAccuracy = activeNodes.length > 0
            ? Math.round(activeNodes.filter(n => n.accuracy_score).reduce((s, n) => s + n.accuracy_score, 0) / Math.max(activeNodes.filter(n => n.accuracy_score).length, 1))
            : 0;

        hiveStatus.collective_iq = Math.round(
            (activeNodes.length / 6) * 40 +
            Math.min(avgKnowledge, 100) * 0.3 +
            avgAccuracy * 0.3
        );

        const directives = [];
        if (hiveStatus.collective_iq >= 80) directives.push(`HIVE_OPTIMAL: All modules operational.`);
        else directives.push(`HIVE_SYNC_PENDING: Building cognitive depth.`);

        const ts = new Date().toISOString().substring(11, 19);
        const log = [...(orchestrator.log || []),
            `[\${ts}] PULSE — IQ:\${hiveStatus.collective_iq} Active:\${hiveStatus.active_nodes}/\${hiveStatus.total_nodes}`
        ].slice(-100);

        await base44.asServiceRole.entities.VantaBrainNode.update(orchestrator.id, {
            status: 'Ready',
            knowledge_data: {
                ...(orchestrator.knowledge_data || {}),
                hive_status: hiveStatus,
                current_directives: directives,
                last_pulse: new Date().toISOString(),
                collective_iq: hiveStatus.collective_iq,
            },
            knowledge_version: (orchestrator.knowledge_version || 0) + 1,
            last_sync: new Date().toISOString(),
            accuracy_score: Math.min(100, (orchestrator.accuracy_score || 50) + 1),
            log,
        });

        return Response.json({
            status: 'ok',
            hive_status: hiveStatus,
            directives,
            collective_iq: hiveStatus.collective_iq,
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});