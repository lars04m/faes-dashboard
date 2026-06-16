import type { Module, Product, OverrideMap } from './types';

export const initialModules: Module[] = [
  {
    id: 'lm-1', name: 'Visual Inspection', isShared: true, status: 'live',
    description: 'Check outer packaging integrity, seams, and label legibility before processing.',
    steps: [
      { id: 'lm-1-s1', stepType: 'text', action: 'Check outer packaging for damage or deformation', imageUrl: 'https://placehold.co/400x220?text=Outer+Packaging', caption: '', checkType: 'checkbox' },
      { id: 'lm-1-s2', stepType: 'visual', action: '', imageUrl: null, caption: 'Seam and closure inspection points — photo required', checkType: 'checkbox' },
      { id: 'lm-1-s3', stepType: 'text', action: 'Verify product label is legible and correctly placed', imageUrl: 'https://placehold.co/400x220?text=Label+Check', caption: '', checkType: 'none' },
    ],
  },
  {
    id: 'lm-2', name: 'Cleaning Protocol', isShared: true, status: 'live',
    description: 'Standard surface cleaning procedure using approved materials before repackaging.',
    steps: [
      { id: 'lm-2-s1', stepType: 'text', action: 'Wipe down all outer surfaces with lint-free cloth', imageUrl: 'https://placehold.co/400x220?text=Cleaning+Step+1', caption: '', checkType: 'none' },
      { id: 'lm-2-s2', stepType: 'text', action: 'Apply approved cleaning agent to contact surfaces', imageUrl: 'https://placehold.co/400x220?text=Cleaning+Step+2', caption: '', checkType: 'checkbox' },
      { id: 'lm-2-s3', stepType: 'markdown', action: '**Drying time**: Allow **60 seconds** minimum before sealing.\n\n> Do not rush this step — premature sealing may trap moisture and damage components.\n\nUse a timer. Document actual drying time in the run sheet.', imageUrl: null, caption: '', checkType: 'none' },
    ],
  },
  {
    id: 'lm-3', name: 'Layer Check', isShared: true, status: 'live',
    description: 'Count and verify internal foam layers and ESD protection are correctly stacked.',
    steps: [
      { id: 'lm-3-s1', stepType: 'text', action: 'Count internal foam layers — confirm matches specification', imageUrl: 'https://placehold.co/400x220?text=Foam+Layers', caption: '', checkType: 'measurement' },
      { id: 'lm-3-s2', stepType: 'text', action: 'Confirm ESD layer is present and undamaged', imageUrl: 'https://placehold.co/400x220?text=ESD+Layer', caption: '', checkType: 'checkbox' },
    ],
  },
  {
    id: 'lm-4', name: 'Label Verification', isShared: true, status: 'draft',
    description: 'Match serial number against manifest and scan barcode for database confirmation.',
    steps: [
      { id: 'lm-4-s1', stepType: 'text', action: 'Match serial number against printed manifest', imageUrl: 'https://placehold.co/400x220?text=Serial+Match', caption: '', checkType: 'checkbox' },
      { id: 'lm-4-s2', stepType: 'visual', action: '', imageUrl: 'https://placehold.co/400x220?text=Barcode+Scan', caption: 'Scan barcode and confirm database entry matches the manifest', checkType: 'checkbox' },
    ],
  },
  {
    id: 'lm-5', name: 'ESD Safety Check', isShared: true, status: 'live',
    description: 'Verify ESD wrist strap and mat continuity before handling sensitive components.',
    steps: [
      { id: 'lm-5-s1', stepType: 'text', action: '', imageUrl: 'https://placehold.co/400x220?text=Wrist+Strap', caption: '', checkType: 'checkbox' },
      { id: 'lm-5-s2', stepType: 'text', action: 'Check ESD mat continuity with tester device', imageUrl: 'https://placehold.co/400x220?text=ESD+Mat', caption: '', checkType: 'measurement' },
    ],
  },
  {
    id: 'lm-6', name: 'Missing Layer Procedure', isShared: false, status: 'live',
    description: 'Corrective procedure when a foam layer is missing from the T-8 packaging set.',
    steps: [
      { id: 'lm-6-s1', stepType: 'text', action: 'Flag the unit and remove from triage line', imageUrl: 'https://placehold.co/400x220?text=Flag+Unit', caption: '', checkType: 'checkbox' },
      { id: 'lm-6-s2', stepType: 'text', action: 'Retrieve correct foam layer from component bin C-4', imageUrl: 'https://placehold.co/400x220?text=Foam+Bin', caption: '', checkType: 'none' },
      { id: 'lm-6-s3', stepType: 'visual', action: '', imageUrl: null, caption: 'Correct stacking order diagram — insert layer as shown', checkType: 'checkbox' },
    ],
  },
  {
    id: 'lm-7', name: 'High-Value Unboxing', isShared: false, status: 'draft',
    description: 'Special unboxing procedure for high-value T-8 units requiring dual sign-off.',
    steps: [
      { id: 'lm-7-s1', stepType: 'text', action: 'Open anti-static outer sleeve with ceramic cutter only', imageUrl: 'https://placehold.co/400x220?text=Ceramic+Cutter', caption: '', checkType: 'checkbox' },
      { id: 'lm-7-s2', stepType: 'visual', action: '', imageUrl: null, caption: 'ESD foam block placement — place unit as shown', checkType: 'measurement' },
    ],
  },
];

export const initialProducts: Product[] = [
  { id: 'p-1', name: 'AXK Color Multi', description: 'Multi-colour packaging variant for the AXK line. Requires cleaning and visual check.', imageUrl: null, moduleIds: ['lm-1', 'lm-2'] },
  { id: 'p-2', name: 'T-8', description: 'Standard RTM triage packaging unit — highest volume on the line.', imageUrl: null, moduleIds: ['lm-1', 'lm-3', 'lm-5', 'lm-6', 'lm-7'] },
  { id: 'p-3', name: 'CargoCast Kit', description: 'Heavy-duty cargo packaging requiring label verification before dispatch.', imageUrl: null, moduleIds: ['lm-2', 'lm-4'] },
  { id: 'p-4', name: 'STBDeep Layer', description: 'Set-top-box unit with deep foam layering — ESD sensitive.', imageUrl: null, moduleIds: ['lm-1', 'lm-5'] },
  { id: 'p-5', name: 'CoolDust 360', description: 'Cooling unit packaging — standard cleaning and layer count required.', imageUrl: null, moduleIds: ['lm-2', 'lm-3'] },
];

export const initialOverrides: OverrideMap = {
  'p-2': {
    'lm-1': {
      'lm-1-s1': { action: 'T-8 specific: check outer casing seam FIRST before general inspection', isLocalOverride: true },
    },
  },
};
