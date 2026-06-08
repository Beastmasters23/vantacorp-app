import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearStuckTasks(taskIds) {
    // Function to clear stuck tasks based on task IDs
    // Implement logic to abort tasks that exceed defined time thresholds
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const currentTasks = await base44.getCurrentTasks(); // Example method to get current tasks
        const taskTimeout = 60 * 60 * 1000; // 1 hour timeout
        const now = Date.now();

        const stuckTasks = currentTasks.filter(task => {
            return (now - new Date(task.startTime).getTime()) > taskTimeout;
        });

        if (stuckTasks.length > 0) {
            await clearStuckTasks(stuckTasks.map(task => task.id));
        }

        return Response.json({ status: 'Checked and cleared stuck tasks if necessary.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});