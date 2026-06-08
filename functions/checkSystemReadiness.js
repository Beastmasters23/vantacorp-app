import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemReadiness() {
    // Check for APT lock files
    try {
        const aptLockExists = await Deno.stat('/var/lib/dpkg/lock');
        if (aptLockExists) {
            return { status: 'error', message: 'APT lock file exists. Tasks cannot proceed.' };
        }
    } catch (error) {
        // No lock file found, which is expected
    }
    
    // Check system resource availability
    const { availableMem } = Deno.memoryUsage();
    if (availableMem < 1048576) { // Assuming 1MB threshold
        return { status: 'error', message: 'Insufficient memory available. Tasks cannot proceed.' };
    }
    
    return { status: 'ok', message: 'System is ready for task execution.' };
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