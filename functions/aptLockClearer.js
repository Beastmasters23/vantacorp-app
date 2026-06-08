import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get -y autoremove; sudo apt-get clean;'],
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
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
        // Proceed with task execution after clearing APT locks
        // Implement your main functionality here
        return Response.json({ message: 'APT locks cleared, ready to execute tasks.' });
    } catch(error) { 
        return Response.json({ error: error.message }, { status: 500 }); 
    }
});