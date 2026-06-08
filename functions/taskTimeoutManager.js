import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskTimeouts = new Map();

    const TIMEOUT_DURATION_MS = 3600000; // 1 hour timeout

    const checkTaskTimeouts = () => {
        for (const [taskId, startTime] of taskTimeouts.entries()) {
            if (Date.now() - startTime > TIMEOUT_DURATION_MS) {
                // Handle task kill logic
                console.log(`Killing stuck task with ID: ${taskId}`);
                taskTimeouts.delete(taskId); // Remove from tracking on kill
                // Logic to forcibly terminate task
            }
        }
    };

    setInterval(checkTaskTimeouts, 60000); // Check every minute

    try {
        // Simulate task execution logic
        const taskId = Math.random().toString(36).substr(2, 9);
        taskTimeouts.set(taskId, Date.now());
        // TODO: Execute the task here, ensuring to remove from timeouts on successful completion
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Simulates task completion
        taskTimeouts.delete(taskId);
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: 'Tasks monitored successfully' });
});