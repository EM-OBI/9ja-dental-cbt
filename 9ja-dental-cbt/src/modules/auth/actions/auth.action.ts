"use server";

import type {
  AuthResponse,
  SignInSchema,
  SignUpSchema,
} from "@/modules/auth/models/auth.model";
import { getAuthInstance } from "@/modules/auth/utils/auth-utils";

// #region SERVER ACTIONS

export const signIn = async ({
  emailOrUsername,
  password,
}: SignInSchema): Promise<AuthResponse> => {
  try {
    const auth = await getAuthInstance();

    // Determine if input is email or username
    const isEmail = emailOrUsername.includes("@");
    let emailToUse = emailOrUsername;

    // If it's a username, query database to get the email
    if (!isEmail) {
      const { getDb } = await import("@/db");
      const { user } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");
      const db = await getDb();

      const userRecord = await db.select().from(user).where(eq(user.name, emailOrUsername)).limit(1);

      if (!userRecord || userRecord.length === 0) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      emailToUse = userRecord[0].email;
    }

    await auth.api.signInEmail({
      body: {
        email: emailToUse,
        password,
      },
      headers: await import("next/headers").then((m) => m.headers()),
    });

    return {
      success: true,
      message: "Signed in succesfully",
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || "An unknown error occured.",
    };
  }
};

export const signUp = async ({
  email,
  password,
  username,
}: SignUpSchema): Promise<AuthResponse> => {
  try {
    const auth = await getAuthInstance();
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
      headers: await import("next/headers").then((m) => m.headers()),
    });

    return {
      success: true,
      message: "Signed up succesfully",
    };
  } catch (error) {
    const err = error as Error;
    let message = err.message || "An unknown error occured.";

    if (message.includes("UNIQUE constraint failed: user.name")) {
      message = "Username is already taken. Please choose another one.";
    } else if (message.includes("UNIQUE constraint failed: user.email")) {
      message = "Email is already registered. Please sign in instead.";
    }

    return {
      success: false,
      message,
    };
  }
};
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const auth = await getAuthInstance();
    await auth.api.signOut({
      headers: await import("next/headers").then((m) => m.headers()),
    });

    return {
      success: true,
      message: "Signed out successfully",
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message: err.message || "An unknown error occurred.",
    };
  }
};
// #endregion
