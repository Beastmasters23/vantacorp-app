import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function cleanTemporaryFiles() {
  const tempDir = '/tmp/vanta_task_*';
  try {
    const { stdout } = await Deno.run({
      cmd: ['bash', '-c', `rm -rf ${tempDir}`],
    }).status();
    return { success: true, message: 'Temporary files cleaned successfully.' };
  } catch (error) {
    throw new Error('Failed to clean temporary files: ' + error.message);
  }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const cleanStatus = await cleanTemporaryFiles();
        return Response.json(cleanStatus, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});