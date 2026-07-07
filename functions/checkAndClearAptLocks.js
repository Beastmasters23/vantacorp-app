import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/lib/apt/archives/lock /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { stdout, stderr } = await exec.output();
    if (stderr.length) {
        throw new Error(new TextDecoder().decode(stderr));
    }
    console.log('APT locks cleared.');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Further task execution logic goes here
        return Response.json({ message: 'APT lock cleared, ready for task execution.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});