import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateAndExecuteCommand(command) {
    const commandExists = await commandAvailabilityChecker(command);
    if (!commandExists) {
        throw new Error(`Command ${command} is not available.`);
    }
    const output = await executeCommand(command);
    if (!output) {
        throw new Error(`Command ${command} executed with no output.`);
    }
    return output;
}

async function commandAvailabilityChecker(command) {
    // Check if the command exists in the environment
    try {
        const { stdout } = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        return stdout.length > 0;
    } catch (error) {
        return false;
    }
}

async function executeCommand(command) {
    try {
        const process = Deno.run({
            cmd: command.split(' '),
            stdout: 'piped',
            stderr: 'piped',
        });
        const output = await process.output();
        process.close();
        return new TextDecoder().decode(output);
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        throw error;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "yourCommandHere"; // Replace with actual command
        const result = await validateAndExecuteCommand(command);
        return Response.json({ message: 'Command executed successfully', result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});