import { z } from 'zod'

export const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
] as const

const urlOptional = z
  .string()
  .trim()
  .url({ message: 'Must be a valid URL' })
  .or(z.literal('').transform(() => undefined))

export const businessFormSchema = z.object({
  business_name: z.string().trim().min(2, 'Business name is required'),
  year_started: z
    .string()
    .trim()
    .regex(/^\d{4}$/g, 'Enter a 4-digit year')
    .refine((y) => {
      const n = Number(y)
      const now = new Date().getFullYear()
      return n >= 1900 && n <= now
    }, 'Enter a valid year'),
  ffl_license_number: z.string().trim().min(5, 'FFL number is required'),
  contact_name: z.string().trim().min(2, 'Contact name is required'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone is required')
    .regex(/^[0-9()+\-\s]+$/, 'Invalid phone format'),
  email: z.string().trim().email('Invalid email'),

  street_address: z.string().trim().min(2, 'Street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state_province: z.enum(STATES, { required_error: 'State is required' }),
  postal_code: z.string().trim().min(3, 'ZIP code is required'),

  hours_mon_fri: z.string().trim().optional(),
  hours_sat: z.string().trim().optional(),
  hours_sun: z.string().trim().optional(),

  website_url: urlOptional.optional(),
  facebook_url: urlOptional.optional(),
  instagram_url: urlOptional.optional(),

  services: z.array(z.string()).optional(),
  specialties: z.string().trim().optional(),
})

export type BusinessFormValues = z.infer<typeof businessFormSchema>


