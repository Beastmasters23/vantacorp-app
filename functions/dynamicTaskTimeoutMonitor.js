import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT_BASE = 60 * 1000; // 60 seconds
    const MAX_ADAPTIVE_TIMEOUT = 180 * 1000; // 3 minutes

    const getDynamicTimeout = async (taskName) => {
        // Hypothetical function to get historical data on task execution times
        const historicalData = await getHistoricalExecutionData(taskName);
        const averageTime = historicalData.reduce((sum, time) => sum + time, 0) / historicalData.length;
        return Math.min(MAX_ADAPTIVE_TIMEOUT, Math.max(TASK_TIMEOUT_BASE, averageTime * 1.5));
    };

    const monitorTasks = async () => {
        const tasks = await getRunningTasks(); // Hypothetical function to fetch running tasks
        for (const task of tasks) {
            const dynamicTimeout = await getDynamicTimeout(task.name);
            if (task.executionTime > dynamicTimeout) {
                await abortTask(task.id); // Hypothetical function to abort tasks
                console.log(`Aborted task ${task.name} due to exceeding dynamic timeout of ${dynamicTimeout}ms.`);
            }
        }
    };

    setInterval(monitorTasks, 30000); // Check every 30 seconds
    return Response.json({ status: "Task monitoring initiated." });
});