import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_CHECK_TIMEOUT = 60 * 1000; // 60 seconds timeout
const TASK_STATUS_URL = 'http://localhost:8000/taskStatus'; // Example status endpoint

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const response = await fetch(TASK_STATUS_URL);
        const taskStatus = await response.json();

        // Check for tasks that are stuck
        const stuckTasks = taskStatus.filter(task => task.running && Date.now() - task.startTime > TASK_CHECK_TIMEOUT);

        if (stuckTasks.length > 0) {
            // Here we can proceed to log or notify about stuck tasks
            console.error('Detected stuck tasks:', stuckTasks);
            // Potential recovery actions can be taken here
        }

        return Response.json({ message: 'Task status checked', stuckTasks });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});