import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function checkAndClearAptLocks() {
        const { success, message } = await base44.checkAptLocks();
        if (!success) {
            await base44.clearAptLocks();
            console.log('Apt locks cleared:', message);
        }
    }

    async function checkCommandAvailability(commands) {
        const missingCommands = commands.filter(cmd => !await base44.checkCommand(cmd));
        if (missingCommands.length) {
            console.log('Missing commands detected:', missingCommands);
            throw new Error('Missing commands: ' + missingCommands.join(', '));
        }
    }

    const essentialCommands = ['cat', 'grep', 'awk'];
    try {
        await checkAndClearAptLocks(); // Ensure apt locks are handled first
        await checkCommandAvailability(essentialCommands); // Validate essential commands
        // Add further task execution logic here
        return Response.json({ status: 'Success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});