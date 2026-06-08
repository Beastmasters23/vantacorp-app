import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTTasks() {
    // Check if any APT lock exists
    const lockExists = await Deno.run({
        cmd: ['bash', '-c', 'sudo lsof /var/lib/dpkg/lock']
    }).status();
    return lockExists.success;
}

async function clearAPTLock() {
    // Clear the APT lock if it exists
    await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend']
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockExists = await clearAPTTasks();
        if (lockExists) {
            await clearAPTLock();
        }
        return Response.json({ message: 'APT lock cleared or not needed.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});