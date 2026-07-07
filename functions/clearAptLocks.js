import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptClearCommand = 'sudo apt-get -y clean && sudo apt-get -y autoremove';
        const process = Deno.run({
            cmd: ['sh', '-c', aptClearCommand],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await process.status();
        
        if (code !== 0) {
            const errorOutput = new TextDecoder().decode(await process.stderrOutput()).trim();
            console.error(`APT lock clearance failed: ${errorOutput}`);
            return Response.json({ message: 'APT lock clearance failed.', details: errorOutput }, { status: 500 });
        }
        
        const output = new TextDecoder().decode(await process.output());
        console.log(`APT locks cleared successfully: ${output}`);
        return Response.json({ message: 'APT locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});