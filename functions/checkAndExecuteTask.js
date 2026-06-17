import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Step 1: Fetch and analyze current task statuses
        const tasks = await fetchTaskStates();
        const stuckTasks = tasks.filter(task => task.status === 'running' && task.duration > 60);

        // Step 2: Check if there are stuck tasks
        if (stuckTasks.length > 0) {
            return Response.json({ error: 'Stuck tasks detected: ' + stuckTasks.length }, { status: 500 });
        }

        // Step 3: Proceed with task execution
        const result = await executeTask();
        return Response.json({ success: true, result: result }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchTaskStates() {
    // Simulated function to retrieve active tasks and their states
    return [
        { id: 1, status: 'running', duration: 65 },
        { id: 2, status: 'completed', duration: 30 },
        { id: 3, status: 'running', duration: 45 }
    ];
}

async function executeTask() {
    // Simulated task execution logic
    return 'Task executed successfully';
}