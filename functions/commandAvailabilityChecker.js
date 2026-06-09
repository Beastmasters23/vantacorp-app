import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const availableCommands = [];
    for (const command of commands) {
        try {
            await Deno.run({ cmd: [command, '--version'], stdout: 'piped', stderr: 'piped' }).status();
            availableCommands.push(command);
        } catch { 
            console.log(`Command not found: ${command}`);
        }
    }
    return availableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'grep']; // Add more commands as required
    const availableCommands = await checkCommandAvailability(commandsToCheck);
    return Response.json({ availableCommands }, { status: 200 });
});