import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyCommandAvailability(commands) {
    const missingCommands = [];
    for (const cmd of commands) {
        const commandCheck = await Deno.run({
            cmd: [cmd, '--version'],
            stdout: 'null',
            stderr: 'null',
        });
        const status = await commandCheck.status();
        if (!status.success) {
            missingCommands.push(cmd);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'grep', 'awk', 'sed']; // Add more essential commands as required
    try {
        const missingCommands = await verifyCommandAvailability(essentialCommands);
        if (missingCommands.length > 0) {
            return Response.json({ status: 'failure', missingCommands }, { status: 400 });
        }
        return Response.json({ status: 'success', message: 'All essential commands are available.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});