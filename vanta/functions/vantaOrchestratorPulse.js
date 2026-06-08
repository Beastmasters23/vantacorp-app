import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaOrchestratorPulse — coordinates the distributed hive.
 * FIX: Uses multiple fields for orchestrator identification (fallback to name).
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const [brainNodes, linuxNodes, recentTasks] = await Promise.all([
            base44.asServiceRole.entities.VantaBrainNode.list('-last_sync', 50),
            base44.asServiceRole.entities.LinuxNode.list('-last_heartbeat', 20),
            base44.asServiceRole.entities.VantaTask.list('-created_date', 20),
        ]);

        // ROBUST IDENTIFICATION: specialization, cognitive_domain, OR name
        const orchestrators = brainNodes.filter(n => {
            const isSpec = n.specialization === 'orchestrator';
            const isDomain = n.cognitive_domain === 'orchestration' || n.cognitive_domain === 'orchestrator';
            const isName = n.node_name && n.node_name.toLowerCase().includes('orchestrator');
            const isReady = n.status !== 'Offline' && n.status !== 'failed';
            return (isSpec || isDomain || isName) && isReady;
        });

        if (orchestrators.length === 0) {
            console.log('[vantaOrchestratorPulse] No orchestrator found.');
            return Response.json({ status: 'ok', message: 'Orchestrator not initialized' });
        }

        const orchestrator = orchestrators[0];
        const now = Date.now();

        const hiveStatus = {
            total_nodes: brainNodes.length,
            active_nodes: brainNodes.filter(n => ['Ready', 'Learning', 'active'].includes(n.status)).length,
            offline_nodes: brainNodes.filter(n => ['Offline', 'failed'].includes(n.status)).length,
            online_linux_nodes: linuxNodes.filter(n => n.status === 'Online' && n.last_heartbeat && (now - new Date(n.last_heartbeat).getTime()) < 120000).length,
            recent_task_failures: recentTasks.filter(t => t.status === 'Failed').length,
            recent_task_successes: recentTasks.filter(t => t.status === 'Completed').length,
        };

        const activeNodes = brainNodes.filter(n => ['Ready', 'Learning', 'active'].includes(n.status));
        const avgKnowledge = activeNodes.length > 0 ? Math.round(activeNodes.reduce((s, n) => s + (n.knowledge_version || 0), 0) / activeNodes.length) : 0;
        const avgAccuracy = activeNodes.length > 0 ? Math.round(activeNodes.reduce((s, n) => s + (n.accuracy_score || 50), 0) / activeNodes.length) : 0;

        hiveStatus.collective_iq = Math.round((Math.min(activeNodes.length, 6) / 6) * 40 + Math.min(avgKnowledge, 100) * 0.3 + Math.min(avgAccuracy, 100) * 0.3);

        const directives = [];
        if (hiveStatus.active_nodes < 6) directives.push('SPAWN_NODES_REQUIRED');
        if (hiveStatus.recent_task_failures > 5) directives.push('SYSTEM_STABILITY_ALERT');
        if (hiveStatus.collective_iq >= 80) directives.push('HIVE_OPTIMAL');

        const ts = new Date().toISOString().substring(11, 19);
        const logEntry = `[${ts}] PULSE — IQ:${hiveStatus.collective_iq} Active:${hiveStatus.active_nodes}`;
        const updatedLog = [...(orchestrator.log || []), logEntry].slice(-100);

        await base44.asServiceRole.entities.VantaBrainNode.update(orchestrator.id, {
            status: 'Ready',
            knowledge_data: { ...(orchestrator.knowledge_data || {}), hive_status: hiveStatus, current_directives: directives, last_pulse: new Date().toISOString() },
            knowledge_version: (orchestrator.knowledge_version || 0) + 1,
            last_sync: new Date().toISOString(),
            log: updatedLog,
        });

        return Response.json({ status: 'ok', hive_status: hiveStatus, directives, collective_iq: hiveStatus.collective_iq });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});