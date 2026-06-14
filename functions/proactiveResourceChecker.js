import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkResourceAvailability(resources) {
    const missingResources = [];
    for (const resource of resources) {
        const exists = await Deno.readFile(resource).
            catch(() => false);
        if (!exists) {
            missingResources.push(resource);
        }
    }
    return missingResources;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredProtocols = [
        '/vanta/bridge/teamwork_protocol.json',
        'other_protocol.json', // Add other critical protocols necessary for the execution flow
    ];
    try {
        const missing = await checkResourceAvailability(requiredProtocols);
        if (missing.length) {
            return Response.json({ error: 'Missing resources: ' + missing.join(', ') }, { status: 400 });
        }
        // Proceed with task execution if all resources are present
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});