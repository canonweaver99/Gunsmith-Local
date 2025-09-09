// Canonical list of gunsmith specialties for reuse across the app (filters, forms, tags)
// Grouped for easy consumption in UIs

export type SpecialtyGroupKey =
  | 'repair_restoration'
  | 'custom_work'
  | 'finishing_services'
  | 'specialized_mods'
  | 'engraving_personalization'
  | 'ffl_services'
  | 'specialized_firearms'
  | 'law_enforcement_military'

export interface SpecialtyGroup {
  key: SpecialtyGroupKey
  label: string
  items: string[]
}

export const GUNSMITH_SPECIALTIES: SpecialtyGroup[] = [
  {
    key: 'repair_restoration',
    label: 'Repair & Restoration',
    items: [
      'General firearm repair',
      'Antique/historical firearm restoration',
      'Military surplus restoration',
      'Vintage sporting rifle restoration',
      'Shotgun repair specialist',
      'Handgun repair specialist',
      'Muzzleloader restoration',
    ],
  },
  {
    key: 'custom_work',
    label: 'Custom Work',
    items: [
      'Custom rifle building',
      'Precision/benchrest rifle building',
      'Competition pistol modifications',
      'Stock making and fitting',
      'Barrel fitting and chambering',
      'Action blueprinting',
      'Trigger work and tuning',
    ],
  },
  {
    key: 'finishing_services',
    label: 'Finishing Services',
    items: [
      'Bluing (hot and cold)',
      'Parkerizing',
      'Cerakote application',
      'Anodizing',
      'Case hardening',
      'Rust removal and prevention',
      'Metal polishing',
    ],
  },
  {
    key: 'specialized_mods',
    label: 'Specialized Modifications',
    items: [
      'Scope mounting and bore sighting',
      'Sight installation (iron sights, optics)',
      'Muzzle device installation',
      'Threading for suppressors/muzzle brakes',
      'Magazine modifications',
      'Safety modifications',
      'Grip and stock modifications',
    ],
  },
  {
    key: 'engraving_personalization',
    label: 'Engraving & Personalization',
    items: [
      'Hand engraving',
      'Machine engraving',
      'Laser engraving',
      'Custom checkering',
      'Inlay work (gold, silver)',
      'Monogramming',
    ],
  },
  {
    key: 'ffl_services',
    label: 'FFL Services',
    items: [
      'Federal Firearms License transfers',
      'Background check processing',
      'Firearm sales',
      'Import/export documentation',
      'Form 4473 processing',
    ],
  },
  {
    key: 'specialized_firearms',
    label: 'Specialized Firearm Types',
    items: [
      'Black powder/muzzleloader specialist',
      'Semi-automatic specialist',
      'Lever action specialist',
      'Single action revolver specialist',
      'Double-barrel shotgun specialist',
      'NFA items (Class 3 dealer)',
    ],
  },
  {
    key: 'law_enforcement_military',
    label: 'Law Enforcement/Military',
    items: [
      'Duty weapon maintenance',
      'Armorer services',
      'Bulk/fleet maintenance',
      'Emergency repair services',
    ],
  },
]

// Flat list helper, useful for search/tagging
export const ALL_SPECIALTIES: string[] = GUNSMITH_SPECIALTIES.flatMap((g) => g.items)


