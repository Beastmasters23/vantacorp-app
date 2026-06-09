import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRequiredCommands(commands) {
    for (const command of commands) {
        const process = Deno.run({
            cmd: ["which", command],
            stdout: "piped",
            stderr: "piped",
        });

        const output = await process.output();
        const errorOutput = await process.stderrOutput();

        if (errorOutput.length > 0) {
            throw new Error(`Required command '${command}' not found.`);
        }
        process.close();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ["cat", "echo", "grep"]; // Add more commands as necessary
    try {
        await checkRequiredCommands(requiredCommands);
        // Proceed with additional task logic...
        return Response.json({ status: "All required commands are available." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});