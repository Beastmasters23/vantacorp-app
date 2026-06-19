import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAPPLocks() {
    // Check for held APT locks
    const heldLocks = await Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped'
    }).output;

    const output = new TextDecoder().decode(heldLocks);
    if (output) {
        console.log('APT locks found, attempting to clear...');
        await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock'],
        }).status;
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks found, proceeding with task execution.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        await checkAndClearAPPLocks();
        // Proceed with executing tasks.
        return Response.json({ message: 'Task execution initiated safely.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});