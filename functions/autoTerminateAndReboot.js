import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function terminateStuckTask(taskId) {
    // Logic to terminate the stuck task, based on taskId passed
    console.log(`Terminating stuck task: ${taskId}`);
    // Simulating task termination
    return true; // Return true on success
}

async function rebootNode() {
    // Logic to reboot the node
    console.log(`Rebooting the node...`);
    // Simulating node reboot
    return true; // Return true on success
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const longRunningTasks = await base44.getLongRunningTasks();
    const taskThreshold = 60; // 60 minutes threshold for task duration

    try {
        for (const task of longRunningTasks) {
            if (task.duration > taskThreshold) {
                await terminateStuckTask(task.id);
                await rebootNode();
            }
        }
        return Response.json({ status: 'checked and handled long-running tasks' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});