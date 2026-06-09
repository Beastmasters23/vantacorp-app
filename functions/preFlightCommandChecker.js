import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ["cat", "echo", "ls"]; // List of critical commands to check
        const missingCommands = commands.filter(cmd => !await commandExists(cmd));

        if (missingCommands.length > 0) {
            console.log('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing critical commands', missing: missingCommands }, { status: 400 });
        }
        // Proceed with task execution if all commands are present
        // ... Task execution logic goes here ...

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function commandExists(command) {
    const process = Deno.run({
        cmd: ["command", "-v", command],
        stdout: "null",
        stderr: "null"
    });
    const { code } = await process.status();
    process.close();
    return code === 0;
}