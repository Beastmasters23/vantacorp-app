import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkNoAptLocks() {
  const exec = Deno.run({
    cmd: ['sh', '-c', 'test -f /var/lib/dpkg/lock']
  });
  const status = await exec.status();
  exec.close();
  return !status.success; // Return true if no locks are found
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const noLocks = await checkNoAptLocks();

        if (!noLocks) {
            throw new Error('APT locks are present. Task cannot proceed.');
        }

        // Proceed with the critical task here
        return Response.json({ message: 'Task can proceed. No locks detected.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});