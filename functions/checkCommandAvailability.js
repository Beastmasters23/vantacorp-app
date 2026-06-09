import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        try {
            await Deno.run({ cmd: [cmd, '--version'], stdout: 'null', stderr: 'null' }).status();
        } catch (error) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'rm', 'cp']; // Add essential commands here
    try {
        const missingCommands = await checkCommandAvailability(essentialCommands);
        if (missingCommands.length) {
            console.error('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing commands detected.', missingCommands }, { status: 500 });
        }

        // Proceed with task execution here

        return Response.json({ message: 'All required commands are available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});