import { z } from "zod";

// Zod schema matching the Pydantic BSOption model
export const bsOptionSchema = z.object({
    r: z.number()
      .min(0, "Interest rate must be positive")
      .max(1, "Interest rate must be less than 1"),
    S: z.number()
      .positive("Stock price must be positive"),
    K: z.number()
      .positive("Strike price must be positive"),
    T: z.number()
      .positive("Time must be positive")
      .max(30, "Time must be less than 30 years"),
    sigma: z.number()
      .positive("Volatility must be positive")
      .max(5, "Volatility seems unreasonably high"),
    type: z.enum(["c", "p"])
  });