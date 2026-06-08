import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const taskResult = await base44.runTask(); // Assuming `runTask` starts a task and returns a promise
        if (!taskResult || !taskResult.output) {
            throw new Error('Task output is missing or invalid, initiating a self-healing procedure.');
        }
        // Further processing of valid taskResult...
        return Response.json({ success: true, output: taskResult.output });
    } catch (error) {
        console.error(error);
        // Notify admins for further investigation on task failures
        await base44.notifyAdmins('Task execution failure: ' + error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});