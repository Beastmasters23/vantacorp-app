import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const availableCommands = await Deno.run({
        cmd: ['bash', '-c', 'command -v ' + commands.join(' || command -v ')]
    });
    const status = await availableCommands.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'grep', 'awk', 'sed']; // Add essential commands for tasks
    const commandsAvailable = await checkCommandAvailability(commandsToCheck);

    if (!commandsAvailable) {
        return Response.json({ error: 'Essential commands are not available. Aborting task execution.' }, { status: 500 });
    }

    // Continue with the normal task execution logic...
    return Response.json({ message: 'All commands are available. Proceeding with task execution.' }, { status: 200 });
});