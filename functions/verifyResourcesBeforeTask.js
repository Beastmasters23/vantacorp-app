import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyResource(resourcePath) {
    const resourceExists = await Deno.lstat(resourcePath).then(() => true).catch(() => false);
    return resourceExists;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const resources = ['/vanta/bridge/teamwork_protocol.json', '/vanta/bridge/lyra_nova_bridge.json'];
    const missingResources = [];

    for (const resource of resources) {
        const exists = await verifyResource(resource);
        if (!exists) {
            missingResources.push(resource);
            console.error(`Missing resource: ${resource}`);
        }
    }

    if (missingResources.length > 0) {
        return Response.json({ error: 'Missing resources detected', missingResources }, { status: 404 });
    }

    return Response.json({ message: 'All resources present' }, { status: 200 });
});