import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const cmd = "sudo fuser -k /var/lib/dpkg/lock-frontend";
    await Deno.run({ cmd: cmd.split(' '), stdout: 'null', stderr: 'null' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});