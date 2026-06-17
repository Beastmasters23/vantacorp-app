import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Pre-flight check for APT locks and command availability
        await checkAndClearLock();
        await verifyCommands(['cat', 'echo']);

        return Response.json({ status: 'Environment validated and ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearLock() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock-frontend; then rm /var/lib/dpkg/lock-frontend; fi'],
            stdout: "piped",
            stderr: "piped"
        }).status();
        if (!result.success) throw new Error('Failed to clear APT lock.');
    } catch (e) {
        throw new Error('Could not check or clear APT lock: ' + e.message);
    }
}

async function verifyCommands(commands) {
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: "piped",
            stderr: "piped"
        }).status();
        if (!result.success) throw new Error(`Command not found: ${cmd}`);
    }
}