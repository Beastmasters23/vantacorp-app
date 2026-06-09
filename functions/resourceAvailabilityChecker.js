import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkResourceAvailability(resources) {
    const missingResources = [];
    for (const resource of resources) {
        try {
            await Deno.stat(resource);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                missingResources.push(resource);
            }
        }
    }
    return missingResources;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const resourcesToCheck = [
        '/vanta/bridge/lyra_nova.json',
        '/vanta/bridge/teamwork_protocol.json',
        '/vanta/revenue/security_whitepaper.json',
        '/vanta/revenue/hive_consensus_spec.json' 
    ];
    const missingResources = await checkResourceAvailability(resourcesToCheck);
    if (missingResources.length) {
        return Response.json({
            error: 'Missing resources',
            details: missingResources
        }, { status: 404 });
    }
    // Proceed with the requested task as all resources are available.
    // Your task execution logic here.
});
