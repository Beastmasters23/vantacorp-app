import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndCheckSystem() {
    // Check for and clear APT locks
    const lockCleared = await clearAPLocks();
    if (!lockCleared) {
        throw new Error('Failed to clear APT locks.');
    }

    // Check system performance and resource usage
    const systemHealth = await checkSystemHealth();
    if (!systemHealth.isHealthy) {
        throw new Error('System health check failed.');
    }

    return { lockCleared, systemHealth };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { lockCleared, systemHealth } = await clearLocksAndCheckSystem();
        return Response.json({
            success: true,
            lockCleared,
            systemHealth
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});