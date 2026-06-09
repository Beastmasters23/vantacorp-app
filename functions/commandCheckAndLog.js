import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandCheck(commands) {
    const commandOutputs = {};
    for (const command of commands) {
        try {
            const output = await Deno.run({
                cmd: ["sh", "-c", command],
                stdout: "piped",
                stderr: "piped"
            }).output();
            // Decode the output from Uint8Array
            commandOutputs[command] = new TextDecoder().decode(output);
        } catch (err) {
            commandOutputs[command] = `Error: ${err.message}`;
        }
    }
    return commandOutputs;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ["your_critical_command_1", "your_critical_command_2"]; // replace with necessary commands
    try {
        const results = await commandCheck(commands);
        // Log command outputs for observability
        console.log(results);
        return Response.json({ status: "success", results }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});