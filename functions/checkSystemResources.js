import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemResources() {
    const memoryUsage = Deno.memoryUsage();
    const cpuUsage = await Deno.run({ cmd: ['sh', '-c', 'grep -c processor /proc/cpuinfo'] });
    const output = await cpuUsage.output();
    return {
        availableMemory: memoryUsage.rss < (memoryUsage.total * 0.8), // Ensuring memory usage is less than 80%
        availableCPUs: parseInt(new TextDecoder().decode(output)) > 1 // Ensuring more than one CPU is available
    };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const resources = await checkSystemResources();
        if (!resources.availableMemory) {
            return Response.json({ error: 'Insufficient memory available for task execution.' }, { status: 503 });
        }
        if (!resources.availableCPUs) {
            return Response.json({ error: 'Insufficient CPU available for task execution.' }, { status: 503 });
        }
        // Proceed to execute the task
        return Response.json({ message: 'All system checks passed, proceeding with task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});