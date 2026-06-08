import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });

    const { code } = await result.status();
    const rawOutput = await result.output();
    const rawError = await result.stderrOutput();

    return { code, output: new TextDecoder().decode(rawOutput), error: new TextDecoder().decode(rawError) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        const aptClearanceResult = await clearAptLocks();
        if (aptClearanceResult.code !== 0) {
            throw new Error(`Failed to clear APT locks: ${aptClearanceResult.error}`);
        }
        return Response.json({ success: true, message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});