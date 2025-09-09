// Canonical list of gunsmith specialties for reuse across the app (filters, forms, tags)
// Grouped for easy consumption in UIs

export type SpecialtyGroupKey =
  | 'general_repairs'
  | 'barrel_services'
  | 'stock_work'
  | 'metal_finishing'
  | 'sights_optics'
  | 'custom_builds'
  | 'restoration'
  | 'ffl_other'

export interface SpecialtyGroup {
  key: SpecialtyGroupKey
  label: string
  items: string[]
}

export const GUNSMITH_SPECIALTIES: SpecialtyGroup[] = [
  {
    key: 'general_repairs',
    label: 'General Repairs & Maintenance',
    items: [
      'Trigger Installation/Tuning',
      'Safety Repairs',
      'Feed Ramp Polishing',
      'Headspace Checking',
      'Magazine Well Work',
      'General Repairs',
    ],
  },
  {
    key: 'barrel_services',
    label: 'Barrel Services',
    items: [
      'Barrel Threading',
      'Barrel Installation',
      'Muzzle Device Installation',
    ],
  },
  {
    key: 'stock_work',
    label: 'Stock Work',
    items: [
      'Stock Work/Bedding',
      'Recoil Pad Installation',
    ],
  },
  {
    key: 'metal_finishing',
    label: 'Metal Finishing',
    items: [
      'Cerakote Coating',
      'Bluing/Refinishing',
      'Engraving',
    ],
  },
  {
    key: 'sights_optics',
    label: 'Sights & Optics',
    items: [
      'Sight Installation',
      'Scope Mounting',
      'Trigger Guard Installation',
    ],
  },
  {
    key: 'custom_builds',
    label: 'Custom Builds',
    items: [
      'Custom Rifle Builds',
      'Custom Pistol Builds',
      'AR-15 Builds',
      'Competition Prep',
      'Tactical Modifications',
    ],
  },
  {
    key: 'restoration',
    label: 'Restoration',
    items: [
      'Restoration Work',
      'Parts Fabrication',
    ],
  },
  {
    key: 'ffl_other',
    label: 'FFL/Other Services',
    items: [
      'FFL Transfers',
      'Hunting Rifle Setup',
    ],
  },
]

// Flat list helper, useful for search/tagging
export const ALL_SPECIALTIES: string[] = GUNSMITH_SPECIALTIES.flatMap((g) => g.items)


