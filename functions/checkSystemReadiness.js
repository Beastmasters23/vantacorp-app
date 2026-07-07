import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemReadiness() {
    // Check for APT locks
    const aptLockExists = await checkAptLocks();
    if (aptLockExists) {
        return { status: 'error', message: 'APT locks detected. Please resolve before executing tasks.' };
    }
    // Check available resources
    const resourcesAvailable = await checkSystemResources();
    if (!resourcesAvailable) {
        return { status: 'error', message: 'Insufficient system resources. Tasks cannot proceed.' };
    }
    return { status: 'ok', message: 'System is ready for tasks.' };
}

async function checkAptLocks() {
    // Sample logic to detect APT locks
    const lockFiles = ['/var/lib/dpkg/lock', '/var/cache/apt/archives/lock'];
    return Promise.any(lockFiles.map(file => Deno.stat(file).then(() => true).catch(() => false))); 
}

async function checkSystemResources() {
    // Sample logic to assess system memory and CPU load
    const memInfo = Deno.memoryUsage(); // Assuming this is available
    return memInfo.free > 200 * 1024 * 1024; // Example memory threshold
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const readinessCheck = await checkSystemReadiness();
        if (readinessCheck.status === 'error') {
            return Response.json({ error: readinessCheck.message }, { status: 503 });
        }
        return Response.json({ message: readinessCheck.message }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});