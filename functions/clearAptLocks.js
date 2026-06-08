import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTRunningTasks() {
    const exec = Deno.run;
    const taskRunner = exec({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo rm /var/lib/dpkg/lock; sudo rm /var/cache/apt/archives/lock; sudo rm /var/lib/apt/lists/lock; echo success'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await taskRunner.status();
    const rawOutput = await taskRunner.output();
    const rawError = await taskRunner.stderrOutput();
    await taskRunner.close();
    return { code, rawOutput: new TextDecoder().decode(rawOutput), rawError: new TextDecoder().decode(rawError) };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const lockStatus = await clearAPTRunningTasks();
    if(lockStatus.code !== 0) {
        return Response.json({ error: lockStatus.rawError }, { status: 500 });
    }
    return Response.json({ message: 'APT locks cleared successfully before task!'}, { status: 200 });
});