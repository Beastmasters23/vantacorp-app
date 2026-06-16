import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const clearAptLocks = async () => {
    const result = await Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await result.status();
    if (code !== 0) {
        const rawErr = await result.stderrOutput();
        throw new Error(new TextDecoder().decode(rawErr));
    }
    await result.close();
};

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT locks before executing tasks
        await clearAptLocks();

        // Placeholder for task execution logic
        // ...

        return Response.json({ message: 'Tasks can now proceed safely.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});