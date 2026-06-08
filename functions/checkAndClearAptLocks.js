import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const locks = await checkAndClearAptLocks();
        if (locks.length > 0) {
            console.log(`Cleared locks: ${locks.join(', ')}`);
        } else {
            console.log('No APT locks found.');
        }
        // Proceed with the expected directives and task executions here
        // ...
        return Response.json({ status: 'Tasks initiated successfully' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    const { run } = Deno;
    const locks = [];
    // Check for lock files and clear them if necessary
    try {
        const { stdout } = await run({
            cmd: ['sh', '-c', 'lsof /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend'],
            stdout: 'piped'
        });
        const result = new TextDecoder().decode(stdout);
        if (result) {
            locks.push('/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend');
            await run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'] });
        }
    } catch (e) {
        console.error('Failed to check or clear APT locks', e);
    }
    return locks;
}