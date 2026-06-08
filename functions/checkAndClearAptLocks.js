import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    try {
        const lockStatus = await Deno.run({
            cmd: ['sh', '-c', 'sudo fuser -v /var/lib/dpkg/lock*'],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { stdout, stderr } = await lockStatus.output();
        if (stdout.length > 0) {
            console.log('APT lock detected, attempting to clear...');
            await Deno.run({
                cmd: ['sudo', 'apt-get', 'remove', '--purge', 'lock'],
            }).status();
            console.log('APT lock cleared.');
        } else {
            console.log('No APT lock detected. System ready.');
        }
    } catch (error) {
        console.error('Failed to check or clear APT locks:', error);
        throw new Error('APT lock resolution failed.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        console.log('Checking for APT locks...');
        await checkAndClearAptLocks();
        return Response.json({ message: 'APT locks checked and resolved if necessary.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});