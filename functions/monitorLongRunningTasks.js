import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const timeoutThreshold = 60 * 1000; // 60 seconds timeout
    const alertThreshold = 3600000; // 1 hour threshold for alerting

    async function monitorLongRunningTasks() {
        const tasks = await fetchTasks(); // Assume an implementation that fetches the current tasks and their statuses
        const now = Date.now();
        for (const task of tasks) {
            if (task.status === "Running" && (now - task.startTime) >= timeoutThreshold) {
                console.warn(`Task ${task.id} is running for too long.`);
                // Implement logic to clear APT lock or adjust priority if needed
                await clearAPTlocks(); // Assuming this function exists
            }
            if (task.status === "Running" && (now - task.startTime) >= alertThreshold) {
                await alertAdmins(`Task ${task.id} has been running for over an hour.`); // Notify admins
            }
        }
    }

    setInterval(monitorLongRunningTasks, 10000); // check every 10 seconds

    return Response.json({ message: "Monitoring for long-running tasks initiated." });
});