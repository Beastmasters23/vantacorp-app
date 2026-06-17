import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT() {
    const result = await Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = new TextDecoder().decode(await result.output());
    return { success: result.status === 0, output };
}

async function checkSystemLoad() {
    const result = await Deno.run({
        cmd: ['uptime'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = new TextDecoder().decode(await result.output());
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks and clear if found
        const aptResult = await clearAPT();
        if (!aptResult.success) {
            console.error('Could not clear APT:', aptResult.output);
            return Response.json({ error: 'Failed to clear APT locks' }, { status: 500 });
        }

        // Check system load
        const systemLoad = await checkSystemLoad();
        console.log('System Load:', systemLoad);

        // Further task execution logic here...

        return Response.json({ message: 'Task environment is ready.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});