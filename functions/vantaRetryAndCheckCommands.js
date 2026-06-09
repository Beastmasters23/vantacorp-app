import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    // Check if essential commands are available
    const missingCommands = commands.filter(command => !Deno.run({ cmd: [command], stdout: 'null' }).status().success);
    return missingCommands;
}

async function clearAptLocks() {
    const result = Deno.run({ cmd: ['sudo', 'apt-get', 'clean'], stdout: 'null' });
    await result.status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls']; // Add other essential commands here
    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length > 0) {
            console.error('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing commands detected', details: missingCommands }, { status: 400 });
        }
        await clearAptLocks();

        // Main task execution logic
        // Example task execution with retries
        let retries = 3;
        while (retries > 0) {
            try {
                // Modify with actual task command
                const taskResult = Deno.run({ cmd: ['example_task'], stdout: 'piped', stderr: 'piped' });
                const { code } = await taskResult.status();
                if (code === 0) {
                    return Response.json({ success: 'Task executed successfully!' });
                } else {
                    throw new Error('Task failed');
                }
            } catch (error) {
                retries--;
                console.warn('Task execution failed. Retries left:', retries);
                if (retries === 0) {
                    return Response.json({ error: 'Task failed after maximum retries' }, { status: 500 });
                }
            }
        }

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});