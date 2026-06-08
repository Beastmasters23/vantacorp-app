import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaNexusHub — Centralized Command API for Vanta Nexus
 * 
 * ARCHITECTURE: INDEPENDENT POWER PROTOCOL (IPP)
 * ─────────────────────────────────────────────────────────────────────────────
 * This module aggregates data from the distributed hive into a single unified
 * state object for the Vanta Nexus HUD.
 */

const IPP_VARIANTS = {
    original: (data) => data,
    B_performance: (data) => ({ ...data, perf_mode: true }),
    C_security: (data) => ({ ...data, secure_mode: true })
};

async function getHiveTelemetry(base44) {
    const [nodes, brainNodes, tasks] = await Promise.all([
        base44.asServiceRole.entities.LinuxNode.list('-last_heartbeat', 10),
        base44.asServiceRole.entities.VantaBrainNode.list('-updated_date', 10),
        base44.asServiceRole.entities.VantaTask.list('-created_date', 5)
    ]);
    return {
        online_nodes: nodes.filter(n => n.status === 'Online').length,
        total_nodes: nodes.length,
        collective_iq: brainNodes.find(b => b.specialization === 'orchestrator')?.knowledge_data?.collective_iq || 0,
        recent_tasks: tasks.map(t => ({ id: t.id, status: t.status, directive: t.directive.slice(0, 50) }))
    };
}

async function getFinancials(base44) {
    const bankingRes = await base44.asServiceRole.functions.invoke('vantaBankingEngine', { action: 'balance_summary' });
    return bankingRes?.data || { balances_by_currency: { USD: 0 }, total_accounts: 0 };
}

async function getStudioStatus(base44) {
    const reasoning = await base44.asServiceRole.entities.VantaBrainNode.filter({ specialization: 'reasoning' });
    return reasoning[0]?.knowledge_data?.studio_progress || { music: 0, web: 0, books: 0, research: 0 };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { variant = 'original' } = body;

        const [telemetry, financials, studio] = await Promise.all([
            getHiveTelemetry(base44),
            getFinancials(base44),
            getStudioStatus(base44)
        ]);

        const rawState = {
            app_name: "Vanta Nexus",
            status: "100%",
            operational_mode: "Phase 2: Revenue & Expansion",
            timestamp: new Date().toISOString(),
            telemetry,
            financials,
            studio,
            version: '1.1.0'
        };

        const transform = IPP_VARIANTS[variant] || IPP_VARIANTS.original;
        const nexusState = transform(rawState);

        return Response.json({
            ok: true,
            app: "Vanta Nexus",
            nexus_state: nexusState
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
