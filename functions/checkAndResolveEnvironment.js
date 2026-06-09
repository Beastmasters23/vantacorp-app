import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveEnvironment(base44) {
    // Check for APT locks
    const locks = await base44.runCommand('sudo fuser /var/lib/dpkg/lock*');
    if (locks) {
        console.log('APT locks detected, attempting to clear...');
        await base44.runCommand('sudo kill -9 ' + locks.join(' '));
        console.log('APT locks have been cleared.');
    } else {
        console.log('No APT locks found.');
    }

    // Check for missing critical commands
    const commands = ['cat', 'echo', 'ls']; // Add any critical commands here
    for (const command of commands) {
        const result = await base44.runCommand(`command -v ${command}`);
        if (!result) {
            console.error(
                `Critical command ${command} is missing. Attempting to reinstall...`
            );
            await base44.runCommand(`sudo apt install -y ${command}`);
        } else {
            console.log(`Critical command ${command} is available.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndResolveEnvironment(base44);
        return Response.json({ message: 'Environment health check completed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});