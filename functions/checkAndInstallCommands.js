import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const requiredCommands = ['cat', 'ls', 'grep'];

async function checkAndInstallCommands() {
    const missingCommands = [];
    for (const command of requiredCommands) {
        const commandExists = await checkCommandExists(command);
        if (!commandExists) {
            missingCommands.push(command);
        }
    }
    if (missingCommands.length > 0) {
        await installCommands(missingCommands);
    }
}

async function checkCommandExists(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null',
    });
    const status = await process.status();
    return status.success;
}

async function installCommands(commands) {
    console.log('Installing missing commands:', commands);
    // Simulate installation with a dummy command
    for (const cmd of commands) {
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'install', '-y', cmd],
            stdout: 'inherit',
            stderr: 'inherit',
        }).status();
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndInstallCommands();
        return Response.json({ status: 'Commands checked and installed if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});