import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        if (!new TextDecoder().decode(result).trim()) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'grep']; // Add more essential commands as needed
    try {
        const missingCommands = await checkCommandAvailability(commandsToCheck);
        if (missingCommands.length > 0) {
            console.log('Missing commands detected:', missingCommands);
            // Possible fallback actions can be implemented here
            return Response.json({ message: 'Missing commands detected', missingCommands }, { status: 400 });
        }
        // Proceed with executing tasks as all commands are available
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});