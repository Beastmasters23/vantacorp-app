import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    exec.close();
    return code === 0;
}

async function checkIfLocked() {
    const exec = Deno.run({
        cmd: ['sudo', 'fuser', '-v', '/var/lib/apt/lists/*'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await exec.output();
    exec.close();
    const outputString = new TextDecoder().decode(output);
    return outputString.includes('locked');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLocked = await checkIfLocked();
        if (isLocked) {
            const lockedCleared = await clearAPTLocks();
            if (!lockedCleared) {
                throw new Error('Failed to clear APT locks');
            }
        }
        // Proceed with executing the intended task code here...
        return Response.json({ message: 'Task execution ready.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});