import { z } from "zod";

const generalProfileSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1)
    .max(50),
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(1)
    .max(50),
});

const userSignupSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email({ message: "Valid email is required." }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password must be less than 50 characters" }),
  })
  .and(generalProfileSchema);

export { generalProfileSchema, userSignupSchema };
