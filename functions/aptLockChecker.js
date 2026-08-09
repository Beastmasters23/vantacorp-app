import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean; sudo dpkg --configure -a; sudo apt-get update'],
        stdout: 'null',
        stderr: 'null'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            throw new Error('Failed to clear APT locks');
        }
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});