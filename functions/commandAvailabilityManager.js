import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CRITICAL_COMMANDS = ['cat', 'ls', 'cd', 'echo'];

async function checkCommandAvailability(commands) {
    const unavailableCommands = commands.filter(command => !await commandExists(command));
    return unavailableCommands;
}

async function commandExists(command) {
    const result = await Deno.run({
        cmd: ["which", command],
        stdout: "piped",
        stderr: "piped"
    }).output();
    return result.length > 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const unavailable = await checkCommandAvailability(CRITICAL_COMMANDS);
        if (unavailable.length > 0) {
            console.log(`Missing Critical Commands: ${unavailable.join(', ')}`);
            return Response.json({ error: `Missing commands: ${unavailable.join(', ')}` }, { status: 500 });
        }
        // Proceed with task execution logic if all commands are available.
        return Response.json({ message: "All critical commands available" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});