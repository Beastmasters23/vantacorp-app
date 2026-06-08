import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkTaskHealth(taskId) {
    const taskInfo = await getTaskInfo(taskId);
    const timeRunning = Date.now() - taskInfo.startTime;
    const maxDuration = 60 * 60 * 1000; // 60 minutes
    return timeRunning < maxDuration;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskId = req.url.split('/').pop(); // Assuming taskId can be derived from the request URL
    
    try {
        const taskHealthy = await checkTaskHealth(taskId);
        if (!taskHealthy) {
            throw new Error(`Task ${taskId} has exceeded allowable running time.`);
        }
        // Continue executing the command as it has passed health checks
        // ... task execution logic goes here
        return Response.json({ message: `Task ${taskId} executed successfully.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});