import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { success } = await exec.status();
    exec.close();
    return success;
}

async function checkEssentials() {
    const commands = ['apt', 'dpkg', 'apt-get'];
    for (const cmd of commands) {
        if (await Deno.run({ cmd: ['which', cmd] }).status()).code !== 0) {
            throw new Error(`Command ${cmd} not found.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkEssentials();
        const lockCleared = await clearAptLocks();
        if (!lockCleared) {
            throw new Error('Failed to clear APT locks.');
        }
        return Response.json({ status: 'APT lock resolver executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});