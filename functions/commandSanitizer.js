import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommands(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const commandExists = await Deno.run({
            cmd: [`which`, command],
            stdout: "piped",
            stderr: "piped"
        });
        const output = new TextDecoder().decode(await commandExists.output());
        if (!output.trim()) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'awk', 'sed']; // Add more relevant commands here.

    try {
        const missingCommands = await checkCommands(requiredCommands);
        if (missingCommands.length) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        // Proceed with main task logic if all commands are present.
        // taskLogic();

        return Response.json({ message: 'All required commands are present.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});