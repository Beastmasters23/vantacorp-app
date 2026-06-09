import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const essentialCommands = ['cat', 'ls', 'echo']; // Add more essential commands as needed

    async function checkCommands(commands) {
        const results = {};
        for (const command of commands) {
            const process = Deno.run({
                cmd: [command, '--version'],
                stdout: 'null',
                stderr: 'null',
            });
            const status = await process.status();
            results[command] = status.success;
            process.close();
        }
        return results;
    }

    try {
        const commandsStatus = await checkCommands(essentialCommands);
        const allCommandsAvailable = Object.values(commandsStatus).every(status => status);

        if (!allCommandsAvailable) {
            throw new Error('Essential commands missing: ' + JSON.stringify(commandsStatus));
        }
        // Proceed with executing other tasks here...

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});