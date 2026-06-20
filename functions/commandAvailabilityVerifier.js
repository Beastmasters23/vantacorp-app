import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkCommandAvailability = async (command) => {
    const result = await Deno.run({
        cmd: ["which", command],
        stdout: "piped"
    });
    const output = await result.output();
    result.close();
    return output.length > 0;
};

const verifyCommandOutput = async (command) => {
    let result = await Deno.run({
        cmd: command,
        stdout: "piped",
        stderr: "piped"
    });
    const output = await result.output();
    const errorOutput = await result.stderrOutput();
    const status = await result.status();
    result.close();
    return {
        success: status.success,
        output: new TextDecoder().decode(output),
        error: new TextDecoder().decode(errorOutput)
    };
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToVerify = ["cat", "ls", "echo"];  // List of critical commands
    const log = {};

    for (let command of commandsToVerify) {
        const isAvailable = await checkCommandAvailability(command);
        log[command] = { isAvailable };
        if (isAvailable) {
            const { success, output, error } = await verifyCommandOutput([command, "--version"]);
            log[command].execution = { success, output, error };
        } else {
            log[command].execution = { success: false, error: 'Command not found' };
        }
    }
    return Response.json({ log }, { status: 200 });
});