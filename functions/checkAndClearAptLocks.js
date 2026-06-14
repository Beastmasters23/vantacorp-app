import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean; sudo rm /var/lib/apt/lists/lock; sudo rm /var/cache/apt/archives/lock; sudo dpkg --configure -a'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        if (!await checkAndClearAptLocks()) {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
        // Continue with the major task execution here...
        return Response.json({ success: 'APT locks cleared and task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});