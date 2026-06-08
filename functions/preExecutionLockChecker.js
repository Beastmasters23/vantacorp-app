import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Function to check for lock files before execution
async function checkForLocks() {
  const lockFilePaths = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend', '/var/cache/apt/archives/lock'];
  const fs = Deno;
  for (const path of lockFilePaths) {
    try {
      await fs.stat(path);
      console.error(`Lock file detected: ${path}`);
      return true; // Lock exists
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        continue; // No lock found, check next
      }
      console.error(`Error checking lock file: ${error.message}`);
    }
  }
  return false; // No locks found
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const hasLocks = await checkForLocks();
    if (hasLocks) {
      return Response.json({ error: 'System is currently locked. Please try again later.' }, { status: 503 });
    }
    // Proceed with the task execution
    // Implement additional task logic here...
    return Response.json({ status: 'Task executed successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});