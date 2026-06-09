import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const criticalCommands = ['cat', 'echo', 'ls', 'mkdir'];

async function checkCommandsAvailability() {
    const notAvailable = criticalCommands.filter(cmd => !await commandExists(cmd));
    if (notAvailable.length > 0) {
        throw new Error(`Critical commands not available: ${notAvailable.join(', ')}`);
    }
}

async function commandExists(command) {
    const { code } = await Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandsAvailability();
        // Proceed with other tasks after command validation
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});