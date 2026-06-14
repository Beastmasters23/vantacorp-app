import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkResources(resources) {
    const missing = [];
    for (const resource of resources) {
        try {
            await Deno.stat(resource);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                missing.push(resource);
            }
        }
    }
    return missing;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredFiles = [
        '/vanta/bridge/teamwork_protocol.json',
        '/vanta/bridge/lyra_nova.json',
        // add other critical resources as necessary
    ];
    const missingResources = await checkResources(requiredFiles);
    if (missingResources.length > 0) {
        return Response.json({ error: 'Missing resources', missingResources }, { status: 400 });
    }
    // Proceed with the task if all resources are present
    return Response.json({ message: 'All resources OK' });
});