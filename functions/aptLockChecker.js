import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLock() {
    const { exec } = Deno;
    try {
        const { code } = await exec("pgrep -x apt");
        return code === 0;
    } catch (error) {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLocked = await checkAptLock();
        if (isLocked) {
            throw new Error("APT is currently locked. Please wait and try again later.");
        }
        // Proceed with executing the main task here...
        return Response.json({ message: "No APT locks detected. Proceeding with task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});