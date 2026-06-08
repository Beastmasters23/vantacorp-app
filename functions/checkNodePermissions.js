import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { nodeId, directive } = await req.json();
        const canExecute = await checkNodePermissions(nodeId, directive);
        if (!canExecute) {
            return Response.json({ error: 'Insufficient permissions to execute this directive.' }, { status: 403 });
        }
        // Proceed with task execution logic here...
        return Response.json({ result: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkNodePermissions(nodeId, directive) {
    // Logic to check the node's permissions based on the directive requested.
    // This is a stub; implement actual permission checking logic based on node configuration.
    const permissionsMap = {
        'AJ-Windows-Node-Final': ['screenshot', 'list_windows'], // Add allowed directives
        // Add other nodes and their permissions
    };
    return permissionsMap[nodeId] && permissionsMap[nodeId].includes(directive);
}