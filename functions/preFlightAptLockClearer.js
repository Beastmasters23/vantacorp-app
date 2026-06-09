import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo sh -c "apt-get clean; rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock"'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await result.status();
    const output = await result.output();
    const errorOutput = await result.stderrOutput();
    return { code, output: new TextDecoder().decode(output), errorOutput: new TextDecoder().decode(errorOutput) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { code, output, errorOutput } = await clearAptLocks();
        if (code !== 0) {
            return Response.json({ error: 'Failed to clear APT locks', errorOutput }, { status: 500 });
        }
        return Response.json({ success: true, message: 'APT locks cleared successfully', output }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});