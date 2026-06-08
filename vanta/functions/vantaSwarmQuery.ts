import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaSwarmQuery — Orchestration helper for the swarm daemon.
 * 1. Returns a list of failed tasks for healing.
 * 2. Runs the node watchdog to detect offline nodes.
 * 3. Returns recent healing logs to prevent duplicate processing.
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const body = await req.json().catch(() => ({}));
        
        // 1. Run Node Watchdog
        const watchdogRes = await base44.asServiceRole.functions.invoke('vantaNodeWatchdog', {});
        
        // 2. Fetch Failed Tasks
        const failedTasks = await base44.asServiceRole.entities.VantaTask.filter({
            status: 'Failed'
        }, '-updated_date', 10);
        
        // 3. Fetch Recent Swarm Healing Logs (to prevent loops)
        const recentHealing = await base44.asServiceRole.entities.VantaHealingLog.filter({
            summary: { "$regex": "^\\[SWARM-HOTFIX\\]" }
        }, '-created_date', 20);
        
        return Response.json({
            status: 'ok',
            failed_tasks: failedTasks,
            recent_healing_triggers: recentHealing.map(h => h.trigger),
            watchdog: watchdogRes?.data,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[vantaSwarmQuery] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
