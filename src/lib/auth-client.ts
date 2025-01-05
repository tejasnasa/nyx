import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
});

export const { signIn, signOut, signUp, useSession } = authClient;
