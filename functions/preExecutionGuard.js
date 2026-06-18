import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    console.log('Attempting to clear apt locks...');
    const result = await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { stdout, stderr } = await result.output();
    if (stderr.length) {
        throw new Error(new TextDecoder().decode(stderr));
    }
    console.log('Apt locks cleared successfully.');
}

async function checkCommandAvailability(command) {
    const result = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { stdout, stderr } = await result.output();
    if (stderr.length || !stdout.length) {
        throw new Error(`Command ${command} is not available.`);
    }
    console.log(`Command ${command} is available.`);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        await checkCommandAvailability('cat');
        // Add other commands as needed
        // Proceed with task execution here
        return Response.json({ message: 'Preparations completed successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});