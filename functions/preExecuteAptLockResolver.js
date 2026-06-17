import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
  const result = await Deno.run({
    cmd: ['bash', '-c', 'sudo rm -rf /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock*'],
    stdout: 'piped',
    stderr: 'piped'
  });

  const { code } = await result.status();
  if (code !== 0) {
    const rawError = await result.stderrOutput();
    throw new Error(`Unable to clear apt locks: ${new TextDecoder().decode(rawError)}`);
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    await clearAptLocks(); // Run the new resolver
    // Proceed with other tasks here...
    return Response.json({ message: 'Apt locks cleared, ready for task execution.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});