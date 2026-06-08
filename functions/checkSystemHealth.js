import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check if there are active APT locks
        const hasAPTLock = await checkForAPTLocks();
        if (hasAPTLock) {
            return Response.json({ error: 'APT lock detected. Please resolve it before continuing.' }, { status: 503 });
        }

        // Check system resource usage
        const resourceStatus = await checkSystemResources();
        if (!resourceStatus.ok) {
            return Response.json({ error: 'High system resource usage detected. Please check system status.' }, { status: 503 });
        }

        // Proceed with the requested task
        return Response.json({ message: 'System is ready to execute tasks.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkForAPTLocks() {
    // Logic to check for APT locks
    const lockFileExists = await Deno.run({
        cmd: ['test', '-e', '/var/lib/dpkg/lock'],
    }).status();
    return lockFileExists.success;
}

async function checkSystemResources() {
    // Logic to check CPU and RAM usage
    const { stdout } = await Deno.run({
        cmd: ['bash', '-c', 'top -bn1 | grep 