import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaOrchestratorPulse — the orchestrator brain node coordinates all others.
 * Updates:
 * - Robust orchestrator identification (specialization OR cognitive_domain)
 * - Improved IQ calculation with fallbacks
 * - Health assessment including failed brain nodes
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const [brainNodes, linuxNodes, recentTasks] = await Promise.all([
            base44.asServiceRole.entities.VantaBrainNode.list('-last_sync', 50),
            base44.asServiceRole.entities.LinuxNode.list('-last_heartbeat', 20),
            base44.asServiceRole.entities.VantaTask.list('-created_date', 20),
        ]);

        // Find orchestrator using specialization or cognitive_domain (for Gen 03)
        const orchestrators = brainNodes.filter(n => 
            (n.specialization === 'orchestrator' || n.cognitive_domain === 'orchestration') && 
            n.status !== 'Offline' && n.status !== 'failed'
        );

        if (orchestrators.length === 0) {
            console.log('[vantaOrchestratorPulse] No orchestrator — continuing pulse cycle');
            return Response.json({ status: 'ok', message: 'Waiting for orchestrator initialization' });
        }

        const orchestrator = orchestrators[0];
        const now = Date.now();

        const hiveStatus = {
            total_nodes: brainNodes.length,
            active_nodes: brainNodes.filter(n => n.status === 'Ready' || n.status === 'Learning' || n.status === 'active').length,
            offline_nodes: brainNodes.filter(n => n.status === 'Offline' || n.status === 'failed').length,
            stale_nodes: brainNodes.filter(n => {
                if (!n.last_sync) return true;
                return (now - new Date(n.last_sync).getTime()) > 600000;
            }).length,
            specializations_present: [...new Set(brainNodes.map(n => n.specialization || n.cognitive_domain))],
            missing_specializations: ['memory', 'reasoning', 'language', 'pattern', 'executor', 'orchestrator']
                .filter(s => !brainNodes.find(n => (n.specialization === s || (n.cognitive_domain && n.cognitive_domain.includes(s.substring(0,4)))) && n.status !== 'Offline')),
            online_linux_nodes: linuxNodes.filter(n => {
                if (n.status !== 'Online' || !n.last_heartbeat) return false;
                return (now - new Date(n.last_heartbeat).getTime()) < 120000;
            }).length,
            recent_task_failures: recentTasks.filter(t => t.status === 'Failed').length,
            recent_task_successes: recentTasks.filter(t => t.status === 'Completed').length,
        };

        const activeNodes = brainNodes.filter(n => n.status === 'Ready' || n.status === 'Learning' || n.status === 'active');
        const avgKnowledge = activeNodes.length > 0
            ? Math.round(activeNodes.reduce((s, n) => s + (n.knowledge_version || 0), 0) / activeNodes.length)
            : 0;
        const avgAccuracy = activeNodes.length > 0
            ? Math.round(activeNodes.reduce((s, n) => s + (n.accuracy_score || 50), 0) / activeNodes.length)
            : 0;

        hiveStatus.collective_iq = Math.round(
            (Math.min(activeNodes.length, 6) / 6) * 40 +
            Math.min(avgKnowledge, 100) * 0.3 +
            Math.min(avgAccuracy, 100) * 0.3
        );

        const directives = [];
        if (hiveStatus.missing_specializations.length > 0) directives.push(`SPAWN_NEEDED: ${hiveStatus.missing_specializations.join(', ')}`);
        if (hiveStatus.stale_nodes > 0) directives.push(`HEALTH_ALERT: ${hiveStatus.stale_nodes} stale nodes`);
        if (hiveStatus.recent_task_failures > hiveStatus.recent_task_successes && recentTasks.length > 5) directives.push(`FAILURE_SPIKE detected`);
        if (hiveStatus.collective_iq >= 80) directives.push(`HIVE_OPTIMAL`);

        const ts = new Date().toISOString().substring(11, 19);
        const logEntry = `[${ts}] PULSE — IQ:${hiveStatus.collective_iq} Active:${hiveStatus.active_nodes}/${hiveStatus.total_nodes}`;
        const updatedLog = [...(orchestrator.log || []), logEntry].slice(-100);

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
            log: updatedLog,
        });

        return Response.json({ status: 'ok', hive_status: hiveStatus, directives, collective_iq: hiveStatus.collective_iq });
    } catch (error) {
        console.error('[vantaOrchestratorPulse] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});