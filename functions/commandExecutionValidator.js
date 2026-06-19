import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const exitCode = await Deno.run({
        cmd: ['command', '-v', command],
        stdout: 'piped',
        stderr: 'piped',
    }).status();
    return exitCode.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'bash']; // Add other critical commands
    const maxExecutionTime = 300; // 5 minutes

    // Validate command availability
    for (const command of commandsToCheck) {
        const available = await checkCommandAvailability(command);
        if (!available) {
            return Response.json({ error: `Command ${command} is missing!` }, { status: 500 });
        }
    }

    // Execute the task with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), maxExecutionTime * 1000);

    try {
        const result = await someTaskExecutionFunction(); // Replace with actual task function
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        if (error.name === 'AbortError') {
            return Response.json({ error: `Task execution exceeded time limit of ${maxExecutionTime} seconds.` }, { status: 408 });
        }
        return Response.json({ error: error.message }, { status: 500 });
    } finally {
        clearTimeout(timeout);
    }
});
