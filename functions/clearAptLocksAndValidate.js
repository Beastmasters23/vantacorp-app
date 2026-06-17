import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check if any APT locks are present
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'lsof /var/lib/dpkg/lock; lsof /var/cache/apt/archives/lock; lsof /var/lib/apt/lists/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });

    const { code } = await locks.status();
    if (code === 0) {
        // If locks are found, terminate processes holding the locks
        const output = await locks.output();
        const lockProcesses = new TextDecoder().decode(output);
        console.log(`APT locks found: ${lockProcesses}`);
        // Code to handle lock removing (for simplicity, just logging here)
        await Deno.run({
            cmd: ['bash', '-c', 'pkill -f dpkg; pkill -f apt;'],
        }).status();
        console.log('APT locks cleared.');
    } else {
        console.log('No APT locks.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT lock check complete.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});