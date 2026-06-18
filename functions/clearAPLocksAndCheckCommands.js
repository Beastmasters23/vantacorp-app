import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPLocksAndCheckCommands() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo apt-get clean && sudo apt-get update'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { code } = await exec.status();
    exec.close();
    if (code !== 0) {
        throw new Error('APT locks are present or command failed.');
    }  

    const essentialCommands = ['cat', 'grep', 'echo', 'ls'];
    for (const command of essentialCommands) {
        const cmdCheck = Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'piped',
            stderr: 'piped',
        });
        const { code: cmdCode } = await cmdCheck.status();
        cmdCheck.close();
        if (cmdCode !== 0) {
            throw new Error(`Required command ${command} is not available.`);
        }
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPLocksAndCheckCommands();
        return Response.json({ message: 'Pre-execution checks passed; environment is ready.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});