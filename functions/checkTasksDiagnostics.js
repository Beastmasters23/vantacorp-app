import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const diagnostics = await checkTasksDiagnostics();
        return Response.json({ diagnostics }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkTasksDiagnostics() {
    // Logic to inspect running tasks and check for potential errors or blockages
    const runningTasks = await getRunningTasks(); // Fetch currently running tasks
    const diagnostics = runningTasks.map(task => {
        const isStuck = checkIfStuck(task);
        const hasOutput = checkTaskOutput(task);
        return {
            id: task.id,
            isStuck,
            hasOutput,
            executionDuration: task.executionTime,
        };
    });
    return diagnostics;
}

function checkIfStuck(task) {
    return task.executionTime > 60; // Example stuck threshold in minutes
}

function checkTaskOutput(task) {
    return task.output !== null; // Assumed that output should not be null for successful tasks
}

async function getRunningTasks() {
    // Placeholder function to get a list of running tasks
    // This should connect to task monitoring system to retrieve real-time tasks
    return [
        { id: 'task1', executionTime: 70, output: null },
        { id: 'task2', executionTime: 30, output: 'Success' },
    ];
}