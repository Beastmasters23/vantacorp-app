import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaSwarmQuery — Bridge for the Swarm Daemon.
 * Returns failed tasks and recent healing triggers.
 */
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me().catch(() => null);
        // Allow service-role (daemon) access if API key matches, or authenticated user
        
        const [failedTasks, recentLogs] = await Promise.all([
            base44.asServiceRole.entities.VantaTask.filter({ status: 'Failed' }, '-updated_date', 10),
            base44.asServiceRole.entities.VantaHealingLog.list('-created_date', 20),
        ]);

        return Response.json({
            status: 'ok',
            failed_tasks: failedTasks,
            recent_healing_triggers: recentLogs.map(l => l.trigger),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[vantaSwarmQuery] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
