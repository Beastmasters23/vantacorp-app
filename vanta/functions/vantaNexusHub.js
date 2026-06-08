import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaNexusHub — Centralized Command API for Vanta Nexus
 * 
 * ARCHITECTURE: INDEPENDENT POWER PROTOCOL (IPP)
 * ─────────────────────────────────────────────────────────────────────────────
 * This module aggregates data from the distributed hive into a single unified
 * state object for the Nexus HUD. 
 *
 * NESTING MODEL:
 *   vantaNexusHub → [NESTED] getTelemetry → [NESTED] getFinancials → [NESTED] getStudio
 */

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════

const IPP_VARIANTS = {
    original: (data) => data,
    B_performance: (data) => ({ ...data, perf_mode: true }),
    C_security: (data) => ({ ...data, secure_mode: true })
};

// ═══════════════════════════════════════════════════════════════════════════════
// NESTED PROTOCOLS
// ═══════════════════════════════════════════════════════════════════════════════

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
    // Aggregated creative progress from reasoning brain
    const reasoning = await base44.asServiceRole.entities.VantaBrainNode.filter({ specialization: 'reasoning' });
    return reasoning[0]?.knowledge_data?.studio_progress || { music: 0, web: 0, books: 0, research: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SERVER
// ═══════════════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { variant = 'original', action = 'fetch_all' } = body;

        // Step 1 — Decompose & Execute Parallel Nests
        const [telemetry, financials, studio] = await Promise.all([
            getHiveTelemetry(base44),
            getFinancials(base44),
            getStudioStatus(base44)
        ]);

        // Step 2 — Apply IPP Variant
        const rawState = {
            timestamp: new Date().toISOString(),
            telemetry,
            financials,
            studio,
            version: '1.0.0'
        };

        const transform = IPP_VARIANTS[variant] || IPP_VARIANTS.original;
        const nexusState = transform(rawState);

        // Step 3 — Store outcome to Memory Brain (Nested Protocol)
        const memoryNodes = await base44.asServiceRole.entities.VantaBrainNode.filter({ specialization: 'memory' });
        if (memoryNodes.length > 0) {
            await base44.asServiceRole.entities.VantaBrainNode.update(memoryNodes[0].id, {
                knowledge_data: {
                    ...memoryNodes[0].knowledge_data,
                    last_nexus_sync: nexusState.timestamp
                },
                log: [...(memoryNodes[0].log || []).slice(-19), `[${nexusState.timestamp}] Nexus Hub state synchronized.`]
            });
        }

        return Response.json({
            ok: true,
            variant_used: variant,
            nexus_state: nexusState
        });

    } catch (error) {
        console.error('[vantaNexusHub] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
