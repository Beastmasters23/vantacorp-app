import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkAndFixPermissions = async (command) => {
    const permissionErrorCodes = [1]; // Extendable list of permission error codes
    const commandExecution = await Deno.run({
        cmd: ['bash', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await commandExecution.status();
    const stdout = new TextDecoder().decode(await commandExecution.output());
    const stderr = new TextDecoder().decode(await commandExecution.stderrOutput());

    if (permissionErrorCodes.includes(code)) {
        console.log(`Permission issue detected. Attempting to elevate: ${stderr}`);
        // Attempt to run with sudo, if applicable
        const elevatedExecution = await Deno.run({
            cmd: ['sudo', 'bash', '-c', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const elevatedResult = await elevatedExecution.status();
        if (elevatedResult.success) {
            console.log('Permission elevated successfully.');
        } else {
            console.error('Failed to elevate permissions:', stderr);
            throw new Error('Permission elevation failed.');
        }
    }
    return stdout;
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const command = "npm install -g some-package"; // Example command
        const output = await checkAndFixPermissions(command);
        return Response.json({ message: output }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});