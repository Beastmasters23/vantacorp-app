import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = commands.filter(cmd => !(await Deno.run({ cmd: [cmd], stdout: "null" }).status()).success);
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo'];  // add critical commands to monitor
    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length) {
            console.error('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing commands detected. Tasks may fail.' }, { status: 500 });
        }
        // Proceed with the next part of the task, indicating all commands are available
        return Response.json({ message: 'All commands are available. Proceeding...'}, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});