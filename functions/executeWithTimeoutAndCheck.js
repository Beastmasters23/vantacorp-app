import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(command) {
    const { exec } = Deno;
    try {
        await exec(`command -v ${command}`);
        return true;
    } catch {
        return false;
    }
}

async function executeWithTimeout(command, timeoutMs) {
    return new Promise((resolve, reject) => {
        const process = Deno.run({ cmd: command.split(' '), stdout: 'piped', stderr: 'piped' });
        const timeout = setTimeout(() => {
            process.kill();
            reject(new Error('Execution timed out'));
        }, timeoutMs);

        process.output().then(output => {
            clearTimeout(timeout);
            resolve(new TextDecoder().decode(output));
        }).catch(err => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const command = 'your_script.sh';  // Replace with your script command
    const timeoutMs = 300000; // 5 minutes timeout

    try {
        const commandAvailable = await checkCommandAvailability('CAT'); // Check for essential cmd
        if (!commandAvailable) {
            throw new Error('Required command is not available.');
        }

        const result = await executeWithTimeout(command, timeoutMs);
        return Response.json({ result }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});