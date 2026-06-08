import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaNexusHub — Centralized Command API for Vanta Nexus
 * HUD Version: 2.1.0 (Mantine)
 */

async function getHiveTelemetry(base44) {
    const [nodes, brainNodes, tasks] = await Promise.all([
        base44.asServiceRole.entities.LinuxNode.list('-last_heartbeat', 20),
        base44.asServiceRole.entities.VantaBrainNode.list('-updated_date', 20),
        base44.asServiceRole.entities.VantaTask.list('-created_date', 15)
    ]);
    return {
        online_nodes: nodes.filter(n => n.status === 'Online').length,
        total_nodes: nodes.length,
        collective_iq: brainNodes.find(b => b.specialization === 'orchestrator')?.knowledge_data?.collective_iq || 0,
        recent_tasks: tasks.map(t => ({ 
            id: t.id, 
            status: t.status, 
            directive: t.directive.slice(0, 100),
            created_at: t.created_date 
        }))
    };
}

async function getFinancials(base44) {
    const walletRes = await base44.asServiceRole.functions.invoke('vantaAdvancedWallet', { action: 'get_state' });
    return walletRes?.data || { total_value_usd: 0, accounts: [] };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const [telemetry, financials] = await Promise.all([
            getHiveTelemetry(base44),
            getFinancials(base44)
        ]);

        const nexusState = {
            app_name: "Vanta Nexus",
            version: "2.1.0",
            status: "100%",
            operational_mode: "Sovereign Ledger Active",
            telemetry,
            financials,
            timestamp: new Date().toISOString()
        };

        return Response.json({
            ok: true,
            nexus_state: nexusState
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
