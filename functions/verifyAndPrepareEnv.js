import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command: string): Promise<boolean> {
    const result = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    }).output();
    return result.length > 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'grep'];
    const unavailableCommands = [];

    for (const command of essentialCommands) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            unavailableCommands.push(command);
        }
    }

    if (unavailableCommands.length > 0) {
        return Response.json({error: 'Missing commands detected:', commands: unavailableCommands}, { status: 503 });
    }

    // Proceed with task execution...
    return Response.json({message: 'All essential commands are available.'}, {status: 200});
});