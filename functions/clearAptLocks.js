import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean; sudo rm -rf /var/lib/apt/lists/*; sudo apt-get update'],
        stdout: 'piped',
        stderr: 'piped',
    });

    const { code } = await exec.status();
    exec.close();

    if (code !== 0) {
        throw new Error('Error clearing APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Additional task execution logic can go here.
        return Response.json({ message: 'APT locks cleared, tasks can proceed safely.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});