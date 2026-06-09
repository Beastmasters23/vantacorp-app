import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTBusy() {
    // Command to check for any APT locks
    const checkLockCommand = 'fuser /var/lib/dpkg/lock';
    const checkResult = await Deno.run({
        cmd: checkLockCommand.split(' '),
        stdout: 'null',
        stderr: 'null',
    }).status();

    // If lock exists, kill any processes holding the lock
    if (checkResult.success) {
        const killLockCommand = 'fuser -k /var/lib/dpkg/lock';
        await Deno.run({
            cmd: killLockCommand.split(' '),
            stdout: 'null',
            stderr: 'null',
        }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTBusy();
        // Proceed with the rest of the function logic here, ensuring any tasks can run smoothly after clearing locks
        return Response.json({ message: 'APT locks cleared, ready to run tasks.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});