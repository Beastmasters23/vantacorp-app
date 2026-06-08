import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemHealth() {
    // Simulated health checks, replace with actual checks in production.
    const freeMemory = Deno.memoryUsage().heapUsed < 500000000; // Example: Check if memory is below 500MB
    const activeTasks = await getActiveTasks(); // Hypothetical function to get the number of active tasks
    const capacityAllowed = activeTasks < 10; // Example task capacity limit

    return freeMemory && capacityAllowed;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isHealthy = await checkSystemHealth();
        if (!isHealthy) {
            return Response.json({ error: 'System under heavy load or low memory, please try again later.' }, { status: 503 });
        }
        // Proceed with executing the directives as the system is healthy.
        const directiveData = await req.json();
        await executeDirective(directiveData); // Hypothetical function to execute the directive
        return Response.json({ status: 'Directive executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});