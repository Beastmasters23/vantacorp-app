import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const timeout = 60 * 1000; // 1 minute timeout

    async function checkAndClearLocks(node) {
        // Function to check APT locks and clear if necessary
        const hasLock = await base44.checkLocks(node);
        if (hasLock) {
            await base44.clearLocks(node);
        }
    }

    async function executeCommandSafely(node, command) {
        await checkAndClearLocks(node);
        const result = await base44.executeCommand(node, command);
        if (result.error) {
            throw new Error(result.error);
        }
        return result.output;
    }

    try {
        // Sample node and command; this would be dynamic based on the request
        const node = 'WindowsNode'; // use the actual node identifier
        const command = 'runTask'; // use the actual command to execute
        const result = await executeCommandSafely(node, command);
        return Response.json({ output: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});