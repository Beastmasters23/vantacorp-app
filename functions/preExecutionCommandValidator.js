import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const availability = {};
    for(const command of commands) {
        const result = await Deno.run({
            cmd: ["which", command],
            stdout: "piped"
        }).output();
        availability[command] = result.length > 0;
    }
    return availability;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const criticalCommands = ["cat", "ls", "mkdir"];
        const commandAvailability = await checkCommandAvailability(criticalCommands);

        for(const command of criticalCommands) {
            if (!commandAvailability[command]) {
                throw new Error(`Critical command not available: ${command}`);
            }
        }

        // Proceed with task execution after ensuring command availability
        return Response.json({ status: "All critical commands are available." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});