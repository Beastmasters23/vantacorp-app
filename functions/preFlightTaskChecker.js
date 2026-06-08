import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Pre-flight checker to verify task states.
        const ongoingTasks = await checkRunningTasks();
        if (ongoingTasks.length > 0) {
            console.log('Ongoing tasks detected:', ongoingTasks);
            return Response.json({ error: 'Ongoing tasks present, please try again later.' }, { status: 409 });
        }

        // Proceed with the intended directive...
        // Your directive functionality goes here. 

        return Response.json({ message: 'Directive executed successfully!' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkRunningTasks() {
    // Simulate a check for running tasks (this would normally query your task management system)
    // Returning an array of running tasks, if any.
    return new Promise((resolve) => {
        const runningTasks = []; // Populate this with actual running task data
        // For the sake of example, let's say we have a mechanism to get this data.
        resolve(runningTasks);
    });
}