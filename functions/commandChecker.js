import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function commandChecker(command, fallbackCommand) {
    const commandExists = await Deno.run({
        cmd: ['which', command],
    }).status();

    if (commandExists.code !== 0) {
        console.warn(`Command ${command} not found, attempting fallback command...`);
        return fallbackCommand ? await executeCommand(fallbackCommand) : null;
    }
    return await executeCommand(command);
}

async function executeCommand(command) {
    const result = await Deno.run({
        cmd: command.split(' '),
        stdout: "piped",
        stderr: "piped",
    });
    const [stdout, stderr] = await Promise.all([result.output(), result.stderrOutput()]);
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);
    if (result.status.code !== 0) {
        console.error(`Command failed: ${command}\nError: ${errorOutput}`);
        return null;
    }
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = 'cat'; // Example command
    const fallbackCommand = 'echo No CAT found'; // Fallback command
    try {
        const output = await commandChecker(command, fallbackCommand);
        return Response.json({ output }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});