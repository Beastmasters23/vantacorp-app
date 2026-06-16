import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkIpAvailability(ip) {
    const output = await executeShellCommand(`ip addr show | grep ${ip}`);
    return output.trim() === '';
}

async function executeShellCommand(command) {
    const process = Deno.run({
        cmd: ["/bin/sh", "-c", command],
        stdout: "piped",
        stderr: "piped"
    });
    const { code } = await process.status();
    if (code !== 0) {
        const rawError = await process.stderrOutput();
        const error = new TextDecoder().decode(rawError);
        throw new Error(`Command failed: ${error}`);
    }
    const rawOutput = await process.output();
    return new TextDecoder().decode(rawOutput);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const ip = "192.168.1.1"; // Replace with the actual IP you want to check
    try {
        const ipAvailable = await checkIpAvailability(ip);
        if (!ipAvailable) {
            return Response.json({ error: "IP address is already assigned." }, { status: 400 });
        }
        // Handle datetime representation, ensuring timezone-aware objects are used
        const currentTime = new Date();
        const utcTime = new Date(currentTime.toUTCString()); // Ensure UTC time format
        return Response.json({ success: true, utcTime }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});