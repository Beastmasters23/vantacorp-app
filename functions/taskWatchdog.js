import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const TASK_TIMEOUT = 60000; // 60 seconds
    const tasks = new Map();

    const isTaskStuck = (taskId) => {
        const startTime = tasks.get(taskId);
        return Date.now() - startTime > TASK_TIMEOUT;
    };

    const monitorTasks = async () => {
        for (const [taskId, startTime] of tasks.entries()) {
            if (isTaskStuck(taskId)) {
                console.warn(`Task ${taskId} is stuck and will be canceled.`);
                // Here you would implement the task cancellation logic
                tasks.delete(taskId);
            }
        }
    };

    setInterval(monitorTasks, 30000); // Check every 30 seconds

    // Example of task registration
    const registerTask = (taskId) => {
        tasks.set(taskId, Date.now());
    };

    // Logic for task handling would go here

    try {
        // Simulating task registration
        registerTask('exampleTask1');
        return Response.json({ message: 'Task registered!', tasks: [...tasks.keys()] });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});