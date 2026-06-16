import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'apt-get -y remove lock']
    });
    const { code } = await exec.status();
    if (code !== 0) throw new Error('Failed to clear APT locks');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Additional task execution logic goes here
        return Response.json({ message: 'Task executed successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});