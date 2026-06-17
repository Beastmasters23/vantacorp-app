import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function removeAptLocks() {
    const result = await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await result.output();
    const error = await result.stderrOutput();
    return { output: new TextDecoder().decode(output), error: new TextDecoder().decode(error) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to remove apt locks before proceeding with the new task
        const { output, error } = await removeAptLocks();
        if (error) {
            console.error('Failed to remove apt locks:', error);
            return Response.json({ error: 'Unable to clear apt locks.' }, { status: 500 });
        }
        console.log('Apt locks cleared successfully:', output);
        // Proceed with tasks that require apt operations here...
        return Response.json({ message: 'Apt locks cleared, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});