import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkStuckTasks() {
    const runningTasks = await getRunningTasks(); // Function to retrieve current running tasks
    for (const task of runningTasks) {
        const duration = Date.now() - task.startTime;
        if (duration > 3600000) { // Check if running for over an hour
            await markAsFailed(task.id); // Function to mark task as failed
            await notifyAdmins(`Task ${task.id} has been marked as failed due to excess run time.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkStuckTasks(); // Invoke the check stuck tasks function
        // Other logic to handle requests can be added here
        return new Response('Checked for stuck tasks', { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});