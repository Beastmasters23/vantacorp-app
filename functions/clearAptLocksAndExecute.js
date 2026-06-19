import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Logic to check and clear APT locks
    const output = await runCommand('sudo fuser -v /var/lib/dpkg/lock*');
    if (output.includes('is locked')) {
        console.log('APT lock detected, attempting to clear...');
        await runCommand('sudo kill -9 $(sudo fuser -v /var/lib/dpkg/lock*)');
    }
}

async function runCommand(command) {
    const process = Deno.run({
        cmd: ['sh', '-c', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const [stdout, stderr] = await Promise.all([process.output(), process.stderrOutput()]);
    process.close();
    return new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Add more logic to execute tasks after clearing locks
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ status: 'Locks checked and cleared if necessary' });
});