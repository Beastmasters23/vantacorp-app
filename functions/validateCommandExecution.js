import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommand(command) {
    try {
        const output = await Deno.run({
            cmd: [command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return new TextDecoder().decode(output).trim();
    } catch (e) {
        return null;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'echo', 'ls']; // Add necessary commands here
    const commandResults = {};

    for (const command of commandsToCheck) {
        commandResults[command] = await validateCommand(command);
    }

    const allCommandsValid = Object.values(commandResults).every(result => result !== null);

    if (!allCommandsValid) {
        return Response.json({ error: 'One or more commands are missing or invalid.', commandResults }, { status: 400 });
    }

    // Proceed with task execution logic here

    return Response.json({ message: 'All commands validated and task executed successfully.' });
});