import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = commands.filter(cmd => ! Deno.run({cmd: [cmd]}));
    if (unavailableCommands.length > 0) {
        throw new Error(`Missing commands: ${unavailableCommands.join(', ')}`);
    }
}

async function retryTask(taskFunc, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await taskFunc();
            return;
        } catch (error) {
            console.error(`Task failed on attempt ${i + 1}: ${error.message}`);
            if (i === retries - 1) throw error;
        }
    }
}

async function performTask() {
    // Here you would implement the actual task logic
    const commandsToCheck = ['cat', 'grep']; // Add more as needed
    await checkCommandAvailability(commandsToCheck);
    // Simulate task execution
    console.log('Task executed successfully!');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await retryTask(performTask);
        return Response.json({ message: 'Task completed successfully!' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});