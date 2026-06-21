import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const STUCK_TASK_THRESHOLD = 60 * 1000; // 60 seconds
const CHECK_INTERVAL = 30 * 1000; // 30 seconds

const runningTasks = new Map(); // Map to track task start times

async function checkRunningTasks() {
    for (const [taskId, startTime] of runningTasks.entries()) {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > STUCK_TASK_THRESHOLD) {
            console.warn(`Task ${taskId} has been running for ${elapsedTime / 1000} seconds, exceeding threshold!`);
            // Notify admins or take necessary actions here
            // Example: await notifyAdmins(taskId);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    if (url.pathname === '/startTask') {
        const taskId = url.searchParams.get('id');
        runningTasks.set(taskId, Date.now());
        // Simulate task running...
        return new Response(`Task ${taskId} started`, { status: 200 });
    }

    // Regularly check for stuck tasks
    setInterval(checkRunningTasks, CHECK_INTERVAL);

    try { } catch(error) { return Response.json({ error: error.message }, { status: 500 }); }
});