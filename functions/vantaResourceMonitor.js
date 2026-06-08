import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemResources() {
    const resourceLimits = { cpu: 80, memory: 200 * 1024 * 1024 };  // Example limits
    const currentUsage = await Deno.resources();

    if (currentUsage.cpu > resourceLimits.cpu || currentUsage.memory > resourceLimits.memory) {
        throw new Error('System resource limits exceeded.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkSystemResources();
        // Proceed with the task execution logic here... 
        return Response.json({ message: 'Task executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});