import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function monitorLongRunningTasks(thresholdMinutes) {
    const currentTasks = await getRunningTasks(); // Function to fetch currently running tasks
    const now = Date.now();
    const alerts = [];

    currentTasks.forEach(task => {
        const duration = (now - task.startTime) / 1000 / 60; // Convert milliseconds to minutes
        if (duration > thresholdMinutes) {
            alerts.push(`Task ${task.id} has been running for ${duration} minutes, exceeding the threshold of ${thresholdMinutes} minutes.`);
            logTaskIssue(task.id, duration); // Log the issue for observability
        }
    });

    return alerts;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const thresholdMinutes = 60; // Set your desired threshold here
    try {
        const alerts = await monitorLongRunningTasks(thresholdMinutes);
        return Response.json({ alerts }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});