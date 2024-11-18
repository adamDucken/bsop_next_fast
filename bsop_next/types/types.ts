import { bsOptionSchema } from '@/validation/bsop_scheme';
import { z } from 'zod';


// Infer TypeScript type from Zod schema
export type BSOptionInput = z.infer<typeof bsOptionSchema>;

// Response type matching your FastAPI response
export interface BSResponse {
  option_price: number;
  details: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    d1: number;
    d2: number;
  };
}