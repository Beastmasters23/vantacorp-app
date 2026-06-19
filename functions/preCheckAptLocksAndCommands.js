import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocksAndCommands() {
    const { exec } = Deno;
    try {
        const { code } = await exec('sudo fuser -v /var/lib/dpkg/lock*'); // Check for APT locks
        if (code === 0) {
            console.warn('APT lock detected. Clearing...');
            await exec('sudo rm /var/lib/dpkg/lock*'); // Clear APT locks
        }
        // Check essential commands
        const commands = ['cat', 'curl', 'ls'];
        for (const cmd of commands) {
            const commandCheck = await exec(`command -v ${cmd}`);
            if (commandCheck.code !== 0) {
                console.error(`Command not found: ${cmd}. Please ensure it is installed.`);
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error(`Error checking APT locks or commands: ${error.message}`);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isReady = await checkAptLocksAndCommands();
        if (!isReady) {
            return Response.json({ error: 'Pre-check failed: APT lock or missing commands.' }, { status: 500 });
        }
        // Execute further tasks here if checks pass
        return Response.json({ message: 'All systems operational. Proceeding with tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});