'use server';

/**
 * @fileOverview A product details lookup AI agent.
 *
 * - lookupProductDetails - A function that handles the product details lookup process.
 * - LookupProductDetailsInput - The input type for the lookupProductDetails function.
 * - LookupProductDetailsOutput - The return type for the lookupProductDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LookupProductDetailsInputSchema = z.object({
  productCode: z.string().describe('The product code to lookup details for.'),
});
export type LookupProductDetailsInput = z.infer<typeof LookupProductDetailsInputSchema>;

const LookupProductDetailsOutputSchema = z.object({
  productName: z.string().optional().describe('The name of the product.'),
  productType: z.string().optional().describe('The type of the product (e.g., MI, ME).'),
  matchProbability: z.number().describe('The probability that the product details match the product code (0-1).'),
});
export type LookupProductDetailsOutput = z.infer<typeof LookupProductDetailsOutputSchema>;

export async function lookupProductDetails(input: LookupProductDetailsInput): Promise<LookupProductDetailsOutput> {
  return lookupProductDetailsFlow(input);
}

const productDetailsLookupPrompt = ai.definePrompt({
  name: 'productDetailsLookupPrompt',
  input: {schema: LookupProductDetailsInputSchema},
  output: {schema: LookupProductDetailsOutputSchema},
  prompt: `You are an AI assistant designed to lookup product details based on the product code.

  Given a product code, you will respond with the product name and product type if you are at least 95% certain of the match.
  If you are less than 95% certain, you will leave the product name and product type blank.

  Respond with JSON format.

  Product Code: {{{productCode}}}`,
});

const lookupProductDetailsFlow = ai.defineFlow(
  {
    name: 'lookupProductDetailsFlow',
    inputSchema: LookupProductDetailsInputSchema,
    outputSchema: LookupProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await productDetailsLookupPrompt(input);
    return output!;
  }
);

