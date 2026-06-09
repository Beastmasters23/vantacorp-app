import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const criticalCommands = ['cat', 'echo', 'ls', 'grep'];

async function checkCommandAvailability() {
    const missingCommands = criticalCommands.filter(async (command) => {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        return result.code !== 0;
    });
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const missingCommands = await checkCommandAvailability();
        if (missingCommands.length > 0) {
            // Log the missing commands and take necessary actions:
            console.error('Missing critical commands:', missingCommands);
            return Response.json({ error: 'Critical commands missing.', missingCommands }, { status: 500 });
        }
        // Continue with normal task execution...
        return Response.json({ message: 'All critical commands are present.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});