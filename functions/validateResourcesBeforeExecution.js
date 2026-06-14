import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateResources(requiredPaths) {
    const missing = requiredPaths.filter(path => !await Deno.stat(path).catch(() => false));
    return missing;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredPaths = [
        '/vanta/bridge/teamwork_protocol.json',
        '/vanta/bridge/lyra_nova_protocol.json'
    ];

    const missingFiles = await validateResources(requiredPaths);

    if (missingFiles.length > 0) {
        return Response.json({ error: 'Missing resources: ' + missingFiles.join(', ') }, { status: 400 });
    }
    // Proceed with executing the task if resources are validated
    // Implement the main task logic here...
    return Response.json({ message: 'All required resources are available.' });
});