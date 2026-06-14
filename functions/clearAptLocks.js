import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ["sudo", "fuser", "-k", "/var/lib/dpkg/lock"]
    });
    const status = await process.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const success = await clearAptLocks();
        return Response.json({ success }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
