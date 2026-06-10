import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const COMMANDS_TO_CHECK = ['cat', 'bash', 'ls', 'echo'];

async function checkCommandsAvailable(): Promise<boolean> {
    const { exec } = Deno;
    for (const cmd of COMMANDS_TO_CHECK) {
        try {
            await exec(`command -v ${cmd}`);
        } catch { // Command not found
            return false;
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const taskDirective = await req.json(); // Assuming directive comes in the request body

    try {
        const commandsAvailable = await checkCommandsAvailable();
        if (!commandsAvailable) {
            throw new Error('Essential commands not available.');
        }

        // Simulate task execution
        const { exitCode } = await exec(taskDirective.command);
        if (exitCode !== 0) {
            throw new Error(`Task failed with exit code ${exitCode}. Retrying...`);
        }

        return Response.json({ status: 'success' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});