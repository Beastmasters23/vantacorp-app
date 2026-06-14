import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock']
    }).status();
    return result.success;
}

async function checkCommandAvailability(cmd) {
    const result = await Deno.run({
        cmd: ['which', cmd],
        stderr: 'null'
    }).status();
    return result.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLocked = await checkAptLocks();
        const commandAvailable = await checkCommandAvailability('echo'); // Replace with necessary commands as needed.

        if (aptLocked) {
            throw new Error('APT is locked. Please resolve the issue before executing tasks.');
        }

        if (!commandAvailable) {
            throw new Error('Essential command is not available.');
        }

        // Proceed with task execution as environment is verified.
        return Response.json({ message: 'Environment is ready for task execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});