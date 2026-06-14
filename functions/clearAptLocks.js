import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
async function clearAptLocks() {
    const { Deno } = globalThis;
    try {
        await Deno.run({
            cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'],
            stdout: 'null',
            stderr: 'null',
        }).status();
    } catch (e) {
        console.error("Failed to clear APT locks:", e);
        throw new Error("Could not clear APT locks");
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();  // clear APT locks before executing tasks
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});