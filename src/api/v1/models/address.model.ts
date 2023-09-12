import { TypeOf, z } from "zod";

export const AddressSchema = z.object({
  building_number: z.string().nullish(),
  apartment_number: z.string().nullish(),
  floor_number: z.string().nullish(),
  latitude: z.number(),
  longitude: z.number(),
});

// inputs
export const CreateAddressInputSchema = AddressSchema;
export type CreateAddressInput = TypeOf<typeof CreateAddressInputSchema>;

export const DeleteAddressSchema = z.object({ address_id: z.string().uuid() });
export type DeleteAddressInput = z.infer<typeof DeleteAddressSchema>;

// outputs
export const AddressOutputSchema = AddressSchema.extend({
  address_id: z.string().uuid(),
  user_id: z.string().uuid(),
});
export type AddressOutput = z.infer<typeof AddressOutputSchema>;
