import { z } from "zod";

export const signInSchema = z.object({
  emailOrUsername: z.string().min(1, { message: "Email or username is required" }),
  password: z
    .string()
    .min(8, { message: "Password should contain minimum 8 character(s)" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: "Password should contain minimum 8 character(s)" }),
  username: z
    .string()
    .min(3, { message: "Username should contain minimum 3 character(s)" }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export type AuthResponse = {
  success: boolean;
  message: string;
};
