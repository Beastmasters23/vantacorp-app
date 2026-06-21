import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearLongRunningTasks(minimumDuration) {
    // This function checks for tasks that have been running longer than the specified minimum duration
    // and attempts to clear them if necessary.
    const runningTasks = await getRunningTasks(); // Hypothetical function to get task status
    for (const task of runningTasks) {
        if (task.duration >= minimumDuration) {
            console.log(`Task ${task.id} has been running for too long, attempting remediation.`);
            await remediateTask(task.id); // Hypothetical function to handle task remediation
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear tasks that have been running over 60 minutes
        await checkAndClearLongRunningTasks(3600);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});