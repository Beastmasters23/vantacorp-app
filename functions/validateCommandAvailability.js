import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateCommands(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: "piped",
            stderr: "piped"
        }).output();
        if (new TextDecoder().decode(result).trim() === '') {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'grep', 'awk']; // Add more commands as needed
    try {
        const missing = await validateCommands(requiredCommands);
        return Response.json({ missingCommands: missing }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});