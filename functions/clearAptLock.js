import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    await Deno.run({
        cmd: ['bash', '-c', 'sudo rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock']
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ message: 'Apt locks cleared successfully' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});