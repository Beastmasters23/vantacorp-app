import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndClearPreExec() {
    const cmdList = ['cat', 'apt-get', 'echo']; // Extend this list with necessary commands
    for (const cmd of cmdList) {
        const cmdExists = await checkCommandAvailability(cmd);
        if (!cmdExists) {
            throw new Error(`Command ${cmd} is missing in the environment.`);
        }
    }

    const isLocked = await checkForAPPLock();
    if (isLocked) {
        await clearAPPLock();
    }
}

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'null',
    });

    const { code } = await process.status();
    process.close();
    return code === 0;
}

async function checkForAPPLock() {
    const process = Deno.run({
        cmd: ['sudo', 'lsof', '/var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'null',
    });

    const { code } = await process.status();
    process.close();
    return code === 0;
}

async function clearAPPLock() {
    await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'],
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await validateAndClearPreExec();
        // Proceed with task execution here (e.g., run task)
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});