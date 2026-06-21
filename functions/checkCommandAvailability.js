import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const unavailableCommands = [];
    for (const cmd of commands) {
        try {
            await Deno.run({ cmd: [cmd, '--version'], stdout: 'null' }).status();
        } catch (e) {
            unavailableCommands.push(cmd);
        }
    }
    return unavailableCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'ls', 'echo']; // Add commands as necessary
    const unavailable = await checkCommandAvailability(essentialCommands);
    if (unavailable.length)
        return Response.json({ error: `Unavailable commands detected: ${unavailable.join(', ')}` }, { status: 500 });
    
    // Proceed with further task operations
    return Response.json({ status: 'All essential commands are available.' });
});