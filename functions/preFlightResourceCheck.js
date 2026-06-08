import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkResources() {
    // Check for APT locks
    const aptLockCheck = await Deno.run({
        cmd: ['bash', '-c', 'lsof /var/lib/dpkg/lock; lsof /var/lib/dpkg/lock-frontend'],
        stdout: 'piped'
    });
    const { stdout } = await aptLockCheck.output();
    if (new TextDecoder().decode(stdout)) {
        throw new Error('APT locks are currently in place. Resolving this issue is required before running tasks.');
    }

    // Check for available resources
    const memCheck = await Deno.run({
        cmd: ['free', '-m'],
        stdout: 'piped'
    });
    const { stdout: memOutput } = await memCheck.output();
    const memAvailable = parseInt(new TextDecoder().decode(memOutput).split('\n')[1].split(/	+/)[6]); // Available memory

    const cpuCheck = await Deno.run({
        cmd: ['vmstat', '-s'],
        stdout: 'piped'
    });
    const { stdout: cpuOutput } = await cpuCheck.output();
    const cpuLoad = parseInt(new TextDecoder().decode(cpuOutput).split('\n')[3].split(/\s+/)[0]); // Load averages

    if (memAvailable < 100) {
        throw new Error('Insufficient memory available to execute tasks.');
    }
    if (cpuLoad > 80) {
        throw new Error('CPU load is too high to execute tasks. Reduce load before retrying.');
    }

    return 'System resources are available.';
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const resourceCheck = await checkResources();
        return Response.json({ status: resourceCheck }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});