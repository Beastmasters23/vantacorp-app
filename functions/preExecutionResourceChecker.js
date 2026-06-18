import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const cpuUsage = await getCPUUsage();
        const memoryUsage = await getMemoryUsage();
        const threshold = 80; // CPU and memory thresholds in percentage

        if (cpuUsage > threshold || memoryUsage > threshold) {
            throw new Error('Resource usage too high. CPU: ' + cpuUsage + '%, Memory: ' + memoryUsage + '%');
        }

        // Continue with task execution
        return Response.json({ status: 'Resources available, task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function getCPUUsage() {
    // Placeholder for actual CPU usage collection logic
    return Math.random() * 100; // Simulated CPU usage for demonstration
}

async function getMemoryUsage() {
    // Placeholder for actual memory usage collection logic
    return Math.random() * 100; // Simulated memory usage for demonstration
}