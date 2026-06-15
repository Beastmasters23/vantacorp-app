import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLock = async () => {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock-frontend; sudo rm /var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await result.output();
    const error = await result.stderrOutput();
    if (error.length > 0) throw new Error(new TextDecoder().decode(error));
    return new TextDecoder().decode(output);
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT lock before processing tasks
        await clearAptLock();
        // Proceed with further task execution logic...
        return Response.json({ message: 'APT locks cleared, ready to execute tasks.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});