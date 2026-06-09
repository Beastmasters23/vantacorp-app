import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function environmentHealthCheck() {
    const { execSync } = Deno;
    // Check for and clear APT locks if any exist
    try {
        execSync('sudo rm /var/lib/apt/lists/lock');
        execSync('sudo rm /var/cache/apt/archives/lock');
        execSync('sudo rm /var/lib/dpkg/lock*');
    } catch (error) {
        console.error('Error clearing APT locks:', error.message);
    }
    // Verify essential command availability
    const essentialCommands = ['cat', 'ls', 'echo'];
    const unavailableCommands = [];

    for (const cmd of essentialCommands) {
        try {
            execSync(`${cmd} --version`);
        } catch (error) {
            unavailableCommands.push(cmd);
        }
    }
    // Log unavailable commands
    if (unavailableCommands.length > 0) {
        console.warn('Missing commands:', unavailableCommands.join(', '));
    }
    return unavailableCommands.length === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    let healthCheckStatus = await environmentHealthCheck();
    if (!healthCheckStatus) {
        return Response.json({ error: 'Environment health check failed. Resolve issues before proceeding.' }, { status: 500 });
    }
    return Response.json({ message: 'Environment is healthy!' });
});