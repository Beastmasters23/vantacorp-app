import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandAvailabilityCheck(commands) {
    const checks = commands.map(async (cmd) => {
        try {
            const result = await Deno.run({ cmd: [cmd, '--version'] }).status();
            return result.success;
        } catch (error) {
            return false;
        }
    });
    return Promise.all(checks);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'echo', 'ls']; // List of commands to verify
    try {
        const availability = await commandAvailabilityCheck(essentialCommands);
        if (availability.includes(false)) {
            throw new Error('One or more essential commands are not available.');
        }
        return Response.json({ message: 'All essential commands are available.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});