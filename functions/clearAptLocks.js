import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/cache/apt/archives/lock'],
    });
    await locks.status();

    const unlock = await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'],
    });
    await unlock.status();
} 

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared and ready for tasks.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});