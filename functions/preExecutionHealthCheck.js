import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Pre-execution command and APT lock checker
        const commands = ['cat', 'bash']; // List of essential commands
        const aptLockCheck = await checkAptLock();

        if (aptLockCheck) {
            return Response.json({ error: 'APT locks present, tasks cannot be executed.' }, { status: 400 });
        }

        const missingCommands = commands.filter((cmd) => !await isCommandAvailable(cmd));
        if (missingCommands.length) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 400 });
        }

        // Proceed with the intended task execution logic here...
        return Response.json({ status: 'All checks passed, proceeding with task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function isCommandAvailable(command) {
    const status = await Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    }).status(); 
    return status.success;
}

async function checkAptLock() {
    const status = await Deno.run({
        cmd: ['sudo', 'fuser', '/var/lib/dpkg/lock'],
        stdout: 'null',
        stderr: 'null',
    }).status(); 
    return status.success;
}