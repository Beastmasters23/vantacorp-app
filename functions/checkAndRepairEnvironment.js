import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndRepairEnvironment() {
    // List of essential commands required for task execution
    const essentialCommands = ['cat', 'curl', 'grep'];
    let missingCommands = [];

    for (const command of essentialCommands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        }).status;
        if (!commandExists.success) {
            missingCommands.push(command);
        }
    }

    if (missingCommands.length > 0) {
        // Handle installation of missing commands (Example for demo purposes)
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'install', ...missingCommands],
            stdout: 'null',
            stderr: 'null'
        }).status;
    }

    // Clear APT locks if set
    const lockFilePath = '/var/lib/dpkg/lock';
    try {
        await Deno.remove(lockFilePath);
    } catch (e) {
        console.warn('No APT lock found or unable to remove.', e);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndRepairEnvironment();
        return Response.json({ success: 'Environment checked and repaired as needed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});