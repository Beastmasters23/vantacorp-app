import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkForAptLock() {
    const { stdout } = await Deno.run({
        cmd: ["sh", "-c", "sudo fuser -v /var/lib/dpkg/lock"]
    }).output();
    return stdout.length === 0;
}

async function checkForCommands(commands) {
    const results = {};
    for (const command of commands) {
        const { stdout } = await Deno.run({
            cmd: ["which", command],
        }).output();
        results[command] = stdout.length > 0;
    }
    return results;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ["cat", "ls", "grep"]; // Add necessary commands here

    try {
        const isAptLockFree = await checkForAptLock();
        const commandAvailability = await checkForCommands(commandsToCheck);

        if (!isAptLockFree) {
            return Response.json({ error: "APT lock is active, cannot proceed with task execution." }, { status: 503 });
        }

        const unavailableCommands = Object.entries(commandAvailability)
            .filter(([_, isAvailable]) => !isAvailable)
            .map(([command]) => command);

        if (unavailableCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${unavailableCommands.join(', ')}` }, { status: 503 });
        }

        // Proceed with task execution...

        return Response.json({ message: "All systems go for task execution." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});