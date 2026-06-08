import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemResources() {
    // Function to check CPU load and Memory usage
    const { exec } = Deno;
    const memoryUsage = await exec("free -m | awk 'NR==2{printf "%s", $3}'");
    const cpuLoad = await exec("uptime | awk '{print $(NF-2)}'");
    return { memoryUsage, cpuLoad };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const resources = await checkSystemResources();
        const memoryLimit = 512; // Set a safe limit for task execution
        const cpuLimit = 1.0; // Set a safe CPU load limit

        if (resources.memoryUsage >= memoryLimit) {
            return Response.json({ error: 'Insufficient memory available for execution.' }, { status: 503 });
        }
        if (parseFloat(resources.cpuLoad) >= cpuLimit) {
            return Response.json({ error: 'CPU load too high for task execution.' }, { status: 503 });
        }

        // Proceed with the task execution after ensuring resources are sufficient
        return Response.json({ status: 'Ready to execute task' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});