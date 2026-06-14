import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).status();

        if (!commandExists.success) {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'ls']; // Add more commands as needed
    try {
        await checkCommandAvailability(essentialCommands);
        // Proceed with normal task execution
        const responsePayload = { message: 'All essential commands are available.' };
        return Response.json(responsePayload, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});