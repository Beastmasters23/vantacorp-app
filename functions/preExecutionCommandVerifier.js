import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CRITICAL_COMMANDS = ['cat', 'ls', 'grep'];

async function checkCommandsAvailability() {
    for (const command of CRITICAL_COMMANDS) {
        const isAvailable = await Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!isAvailable.success) {
            throw new Error(`Critical command missing: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkCommandsAvailability();
        // Proceed with task execution logic here
        return Response.json({ success: true, message: 'All commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});