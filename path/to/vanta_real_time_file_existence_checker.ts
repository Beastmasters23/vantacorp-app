import { serve } from 'https://deno.land/std/http/server.ts';

async function checkFileExists(filePath) {
    try {
        await Deno.stat(filePath);
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            return false;
        }
        throw error;
    }
}

async function handleRequest(req) {
    const url = new URL(req.url);
    const filePath = url.searchParams.get('file');

    if (!filePath) {
        return new Response('File path not provided.', { status: 400 });
    }

    const exists = await checkFileExists(filePath);
    return new Response(JSON.stringify({ exists }), { headers: { 'Content-Type': 'application/json' }});
}

serve(handleRequest);