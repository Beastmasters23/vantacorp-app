import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailable(command) {
    const { exec } = Deno;
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch {
        return false;
    }
}

async function checkEnvironmentAndTimeout(taskFunction, timeout = 300) {
    const commandsToCheck = ['cat', 'ls', 'echo'];
    const unavailableCommands = [];

    for (let command of commandsToCheck) {
        if (!(await checkCommandAvailable(command))) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        throw new Error(`Missing commands: ${unavailableCommands.join(', ')}`);
    }

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), timeout * 1000));
    const taskPromise = taskFunction();
    return await Promise.race([taskPromise, timeoutPromise]);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkEnvironmentAndTimeout(async () => {
            // Your task logic here
            // Example: await executeSomeTask();
            console.log('Task executed successfully');
        });

        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});