import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const taskStateChecker = async () => {
        const currentlyRunningTasks = await getCurrentlyRunningTasks(); // Retrieve current running tasks
        if (currentlyRunningTasks.length > 0) {
            console.warn('Tasks are currently running, will not begin new execution.');
            throw new Error('System is busy with ongoing tasks.');
        }
    };

    const getCurrentlyRunningTasks = async () => {
        // Simulated function to return currently running tasks
        // In an actual implementation, this would query the task manager or logs
        return []; // Return an empty array if no tasks are running
    };

    try {
        await taskStateChecker(); // Perform the task state check before executing anything
        // Rest of your task execution logic here...
        return Response.json({ message: 'Tasks executed successfully.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});