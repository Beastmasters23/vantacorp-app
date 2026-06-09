import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { success } = await process.status();
    process.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        if (await clearAptLocks()) {
            return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
        } else {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});