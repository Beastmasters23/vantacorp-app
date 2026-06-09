import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndRetryCommand(command, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const result = await Deno.run({
            cmd: ["sh", "-c", command],
            stdout: "piped",
            stderr: "piped",
        });
        const output = await result.output();
        const error = await result.stderrOutput();
        if (result.status === 0) {
            return output;
        } else {
            console.error(`Command failed on attempt ${i + 1}: ${error}`);
            // Checking if it's a command not found error
            if (new TextDecoder().decode(error).includes("command not found")) {
                console.log(`Command not found, retrying...`);
                await new Promise(res => setTimeout(res, 2000)); // wait before retrying
            } else {
                throw new Error(`Command failed with output: ${new TextDecoder().decode(error)}`);
            }
        }
    }
    throw new Error(`Command ${command} failed after ${retries} attempts`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Example usage of the checkAndRetryCommand function
        const commandToRun = "your_critical_command_here";
        const output = await checkAndRetryCommand(commandToRun);
        return Response.json({ success: true, output: new TextDecoder().decode(output) }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});