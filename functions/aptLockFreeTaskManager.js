import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { status } = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend'],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return status === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        if (await clearAptLocks()) {
            // Proceed with the desired task execution here.
            return Response.json({ message: 'APT locks have been cleared, proceeding with execution.' }, { status: 200 });
        }
        attempt += 1;
        console.log(`Retrying... (${attempt})`);
    }
    return Response.json({ error: 'Failed to clear APT locks after multiple attempts.' }, { status: 500 });
});