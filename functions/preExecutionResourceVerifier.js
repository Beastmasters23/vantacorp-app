import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkResources(resources) {
    const results = await Promise.all(resources.map(async resource => {
        const exists = await Deno.stat(resource).catch(() => false);
        return { resource, exists: !!exists };
    }));
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredResources = ['/vanta/bridge/lyra_nova_protocol.json', '/vanta/bridge/teamwork_protocol.json'];
    try {
        const resourceStatus = await checkResources(requiredResources);
        const missingResources = resourceStatus.filter(res => !res.exists);
        if (missingResources.length > 0) {
            return Response.json({ error: 'Missing resources', details: missingResources }, { status: 400 });
        }
        // Proceed with the intended task execution  after resource validation.
        return Response.json({ message: 'All resources are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});