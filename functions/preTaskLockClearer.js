import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForLocks() {
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'dpkg --get-selections | grep -e "hold"']
    }).output();
    return new TextDecoder().decode(locks).trim() !== '';
}

async function clearLocks() {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean']
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const lockExists = await checkForLocks();
    if (lockExists) {
        await clearLocks();
    }
    // Proceed with the regular task execution.
    return Response.json({ message: 'Pre-checks completed, tasks can proceed.' }, { status: 200 });
});