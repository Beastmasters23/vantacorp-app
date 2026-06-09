import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTPaths() {
    try {
        // Attempt to resolve APT locks
        const response = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
        });
        await response.status();
        return true;
    } catch (e) {
        console.error('Failed to clear APT paths:', e);
        return false;
    }
}

async function checkCommandAvailability(command) {
    try {
        const response = await Deno.run({
            cmd: ['which', command],
            stdout: "piped",
            stderr: "piped"
        });
        const { code } = await response.status();
        return code === 0;
    } catch (e) {
        console.error('Command availability check failed:', e);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const tasks = ['apt-get', 'cat', 'echo']; // List of critical commands to check
    const tasksToCheck = await Promise.all(tasks.map(checkCommandAvailability));
    
    if (tasksToCheck.every(status => status)) {
        const aptCleared = await clearAPTPaths();
        if (aptCleared) {
            return Response.json({ message: 'APT locks cleared and all commands are available.' }, { status: 200 });
        } else {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
    } else {
        return Response.json({ error: 'One or more critical commands are unavailable.' }, { status: 500 });
    }
});