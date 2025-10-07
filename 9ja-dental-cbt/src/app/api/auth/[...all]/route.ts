import { toNextJsHandler } from "better-auth/next-js";
import { getAuthInstance } from "@/modules/auth/utils/auth-utils";

// Force dynamic rendering for API routes
export const dynamic = "force-dynamic";

// Create a dynamic handler that gets the auth instance
const createHandler = async () => {
  const auth = await getAuthInstance();
  return toNextJsHandler(auth.handler);
};

// Export the handlers
export async function GET(request: Request) {
  const { GET: handler } = await createHandler();
  return handler(request);
}

export async function POST(request: Request) {
  const { POST: handler } = await createHandler();
  return handler(request);
}
