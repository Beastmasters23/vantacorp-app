import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const tasks = await fetchRunningTasks(); // A function that retrieves running tasks
        const stuckTasks = tasks.filter(task => task.duration > 60); // Identify stuck tasks

        if (stuckTasks.length) {
            await notifyOperators(stuckTasks); // A function to notify operators of stuck tasks
            console.log(`Alerted operators about ${stuckTasks.length} stuck task(s).`);
        }

        return Response.json({ message: 'Task monitoring completed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function fetchRunningTasks() {
    // Placeholder for actual logic to fetch running tasks
    return [
        { id: 1, duration: 65 },
        { id: 2, duration: 30 }
    ];
}

async function notifyOperators(tasks) {
    // Placeholder for actual notification logic, e.g., sending messages to an admin channel
    console.log('Operators notified for tasks:', tasks);
}