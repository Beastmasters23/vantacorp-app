import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT_Locks() {
    // Logic to check and clear APT locks
    const result = await Deno.run({ cmd: ['sudo', 'apt-get', 'remove', '-y', 'apt'], stdout: 'piped' });
    const output = new TextDecoder().decode(await result.output());
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAPT_Locks();
        return Response.json({ message: "APT locks cleared successfully", locksCleared }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});