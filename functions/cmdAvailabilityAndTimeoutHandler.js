import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command: string): Promise<boolean> {
    const process = Deno.run({
        cmd: ["which", command],
        stdout: "null",
        stderr: "null"
    });
    const status = await process.status();
    return status.success;
}

async function executeCommandWithTimeout(command: string, timeout: number = 300000): Promise<string> {
    const process = Deno.run({
        cmd: command.split(" "),
        stdout: "piped",
        stderr: "piped"
    });
    const timeoutPromise = new Promise<string>((_, reject) => setTimeout(() => {
        process.kill(Deno.Signal.SIGTERM);
        reject(new Error(`Command '${command}' timed out.`));
    }, timeout));

    const outputPromise = process.output().then(output => new TextDecoder().decode(output));
    const errorPromise = process.stderrOutput().then(err => new TextDecoder().decode(err));

    const output = await Promise.race([outputPromise, timeoutPromise]);
    const status = await process.status();
    if (!status.success) {
        const error = await errorPromise;
        throw new Error(`Command '${command}' failed: ${error}`);
    }
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = req.headers.get('X-Command'); // Assuming the command comes from the header
    if (!command) {
        return Response.json({ error: 'Command not provided.' }, { status: 400 });
    }

    try {
        const available = await checkCommandAvailability(command);
        if (!available) {
            throw new Error(`Command '${command}' is not available on the system.`);
        }

        const result = await executeCommandWithTimeout(command);
        return Response.json({ output: result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});