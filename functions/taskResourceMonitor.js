import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Monitor system resources and load
        const load = await Deno.run({
            cmd: ['uptime'],
            stdout: 'piped',
        }).output();
        const uptimeOutput = new TextDecoder().decode(load);

        // Parsing the load average, extracting the 1, 5, and 15-minute loads
        const loads = uptimeOutput.match(/load average: (\d+\.\d+), (\d+\.\d+), (\d+\.\d+)/);
        const load1 = parseFloat(loads[1]);
        const load5 = parseFloat(loads[2]);
        const load15 = parseFloat(loads[3]);

        // Define threshold for optimal load. For simplicity, a load over the number of CPU cores can indicate potential throttling.
        const cpuCores = 4; // Assuming a system with 4 CPU cores
        const threshold = cpuCores * 1.5; // Threshold condition (1.5 times number of cores is a common standard)

        if (load1 > threshold) {
            // Too much load to run tasks, notify admins and abort
            await base44.notifyAdmins('System load too high: ' + load1 + ' exceeding threshold: ' + threshold);
            return Response.json({ error: 'High system load, task aborted.' }, { status: 503 });
        }

        // If load is acceptable, proceed to execute task
        // Placeholder for task execution code
        const taskResponse = {}; // Replace with actual task functions
        return Response.json({ status: 'Task executed successfully', result: taskResponse });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});