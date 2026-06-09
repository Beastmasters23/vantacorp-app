import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndCommands() {
    const lockCheck = await Deno.run({
        cmd: ['bash', '-c', 'fuser -v /var/lib/dpkg/lock || true'],
    }).status();
    if (lockCheck.code !== 0) {
        await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock'] }).status();
    }

    const commands = ['cat', 'bash', 'echo']; // Add more critical commands if needed
    for (const command of commands) {
        const cmdCheck = await Deno.run({ cmd: ['bash', '-c', `command -v ${command}`] }).status();
        if (cmdCheck.code !== 0) {
            throw new Error(`Critical command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAPTAndCommands();
        // Proceed with task execution
        return Response.json({ status: 'Tasks ready to execute' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});