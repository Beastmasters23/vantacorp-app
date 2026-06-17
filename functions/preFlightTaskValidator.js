import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const lockFile = '/var/lib/dpkg/lock';
    const exists = await Deno.stat(lockFile).then(() => true).catch(() => false);
    return exists;
}

async function checkCommandAvailability(command) {
    const result = await Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    });
    const status = await result.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await checkAptLocks()) {
            return Response.json({ error: 'APT is locked. Unable to execute tasks.' }, { status: 503 });
        }

        const commandsToCheck = ['CAT', 'other_command'];  // Add more commands as needed
        for (const command of commandsToCheck) {
            if (!await checkCommandAvailability(command)) {
                return Response.json({ error: `Command not found: ${command}` }, { status: 404 });
            }
        }

        // Proceed to execute task...
        return Response.json({ success: 'Environment is clear, task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});