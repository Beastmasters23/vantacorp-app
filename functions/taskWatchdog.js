import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    // Function to monitor and manage tasks
    async function taskWatchdog() {
        const tasks = await getRunningTasks(); // Gets current running tasks
        for (const task of tasks) {
            if (task.status === 'Running' && task.duration > 60) { // replace 60 with your timeout threshold
                await resetTask(task); // function to reset the task
                console.log(`Task ${task.id} reset due to long-running status.`);
            }
        }
        await logSystemDiagnostics(); // function to log system state
    }

    try {
        // Call the watchdog to monitor tasks
        await taskWatchdog();
        return Response.json({ message: 'Task monitoring executed successfully.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});