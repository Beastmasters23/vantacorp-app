import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function recoverStuckTasks() {
    const tasks = await getTasks(); // hypothetical function to list tasks
    const stuckTasks = tasks.filter(task => task.status === 'running' && (Date.now() - task.startTime) > 3600000);

    for (const task of stuckTasks) {
        await terminateTask(task); // hypothetical function to terminate task
        // Logging the action taken
        await logAction(`Terminated stuck task: ${task.id}`);
        await notifyAdmin(`Task ${task.id} was terminated due to it exceeding allowed execution time.`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await recoverStuckTasks();
        return Response.json({ message: 'Recovery task executed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});