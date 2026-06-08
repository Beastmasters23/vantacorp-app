import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkWindowsPermissions(node: string, directive: string): Promise<boolean> {
    // Simulate a permissions check relevant for Windows
    // In a real scenario, this would involve querying the system's user permissions.
    const allowedCommands = ['screenshot', 'file read', 'list windows'];
    return allowedCommands.some(cmd => directive.toLowerCase().includes(cmd));
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { node, directive } = await req.json(); // Expecting `{ node: string, directive: string }`
    try {
        const hasPermission = await checkWindowsPermissions(node, directive);
        if (!hasPermission) {
            throw new Error('Permission denied for this operation on the given node.');
        }
        return Response.json({ message: 'Permission granted.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});