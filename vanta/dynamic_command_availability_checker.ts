import { serve } from "https://deno.land/std/http/server.ts";
import { checkCommandAvailability } from "@base44/sdk";

async function handler(req) {
    const { searchParams } = new URL(req.url);
    const command = searchParams.get("command");

    if (!command) {
        return new Response("Command is required", { status: 400 });
    }

    const isAvailable = await checkCommandAvailability(command);
    return new Response(JSON.stringify({ command, available: isAvailable }), {
        headers: { "Content-Type": "application/json" },
    });
}

console.log("Server running at http://localhost:8000/");
serve(handler);