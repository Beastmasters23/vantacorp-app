import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await resolveAptLocks();
        await checkCommands();
        return Response.json({ status: 'Ready' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function resolveAptLocks() {
    // Implement logic to check and resolve APT locks
    const locks = await checkForAptLocks();
    if (locks) {
        await clearAptLocks(); // Assuming this function is defined elsewhere
    }
}

async function checkCommands() {
    const commands = ['cat', 'grep', 'find']; // Add required commands
    for (const command of commands) {
        const isAvailable = await commandExists(command);
        if (!isAvailable) {
            throw new Error(`Command not found: ${command}`);
        }
    }
}

async function commandExists(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped'
    });
    const output = await process.output();
    const outputStr = new TextDecoder().decode(output).trim();
    return outputStr.length > 0;
}