import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * vantaStrategicScout — Phase 2 Revenue & Expansion Engine
 * 
 * ARCHITECTURE: INDEPENDENT POWER PROTOCOL (IPP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Variant A (original): Web-dev contract focus
 * Variant B (research): Technical documentation focus
 * Variant C (automation): Python/AI automation focus
 *
 * NESTING MODEL (SCLP Implementation):
 *   DECOMPOSE → [NESTED] SearchWeb → [NESTED] AnalyzeOpportunity → [NESTED] StoreMBS
 */

const SCOUT_VARIANTS = {
    original: ['web development contract jobs', 'react freelance developer needed'],
    B_documentation: ['technical writer documentation remote', 'API documentation freelance'],
    C_automation: ['AI automation specialist remote', 'python backend developer contract']
};

async function decomposeTask(topic) {
    return [`remote ${topic} opportunities 2026`, `${topic} freelance contracts`];
}

async function researchMarket(base44, queries) {
    const searchRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Conduct a market scan for these queries: ${queries.join(', ')}. Identify top 3 active platforms or job types.`,
        add_context_from_internet: true
    });
    return searchRes;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { variant = 'original' } = body;

        // Step 1 — DECOMPOSE (Nesting Protocol)
        const activeTopics = SCOUT_VARIANTS[variant] || SCOUT_VARIANTS.original;
        const subQueries = await decomposeTask(activeTopics[0]);

        // Step 2 — RESEARCH (Nested Protocol with Internet Access)
        const marketIntelligence = await researchMarket(base44, subQueries);

        // Step 3 — SYNTHESIZE & CONVINCE
        const strategy = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Synthesize this market research: "${marketIntelligence}". Create a 3-step action plan for Vanta to secure one of these contracts.`,
            response_json_schema: { type: 'object', properties: { plan: { type: 'array', items: { type: 'string' } }, confidence: { type: 'number' } } }
        });

        // Step 4 — STORE to Meta-Belief Store (MBS Update Protocol)
        await base44.asServiceRole.functions.invoke('vantaAGIGateway', {
            action: 'belief_update',
            statement: `Strategic Revenue Opportunity: ${activeTopics[0]} has high demand. Plan: ${strategy.plan[0]}`,
            confidence: strategy.confidence,
            source: 'vantaStrategicScout'
        });

        return Response.json({
            ok: true,
            variant_used: variant,
            scout_report: {
                topic: activeTopics[0],
                market_intelligence: marketIntelligence,
                action_plan: strategy.plan,
                confidence: strategy.confidence
            }
        });

    } catch (error) {
        console.error('[vantaStrategicScout] Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
