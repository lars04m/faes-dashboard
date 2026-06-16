import type {
  Instruction,
  OperatorOnShift,
  PreviewStep,
  PublishData,
  RejectionData,
  ReviewData,
  RejectionFeedback,
  VersionEntry,
  VersionHistory,
  VersionsDataState,
} from './types';

/** All work instructions shown on the main list screen. */
export const INITIAL_INSTRUCTIONS: Instruction[] = [
  {
    id: 'wi-1',
    title: 'Product T8',
    version: 'v3.3',
    author: 'Jane Larsen',
    updatedAt: 'May 28th',
    status: 'live',
    authorInitials: 'JL',
  },
  {
    id: 'wi-2',
    title: 'Product T28',
    version: 'v2.1',
    author: 'Jane Larsen',
    updatedAt: 'May 20th',
    status: 'live',
    authorInitials: 'JL',
  },
  {
    id: 'wi-3',
    title: 'T10',
    version: 'v1.3',
    description: 'Requires daily calibration before probe alignment',
    author: 'Marc Bakker',
    authorInitials: 'MB',
    updatedAt: 'June 3rd',
    status: 'review',
  },
  {
    id: 'wi-4',
    title: 'T93',
    version: 'v0.4',
    description: 'Initial solvent handling and dispenser workflow',
    author: 'Sara Willems',
    authorInitials: 'SW',
    updatedAt: 'June 4th',
    status: 'draft',
  },
  {
    id: 'wi-5',
    title: 'Product T12',
    version: 'v2.0',
    description: 'Final assembly torque sequence for T12 housing',
    author: 'Jane Larsen',
    authorInitials: 'JL',
    updatedAt: 'June 1st',
    status: 'live',
  },
  {
    id: 'wi-6',
    title: 'T45',
    version: 'v1.2',
    description: 'Cable harness routing and strain relief checks',
    author: 'Marc Bakker',
    authorInitials: 'MB',
    updatedAt: 'May 30th',
    status: 'live',
  },
  {
    id: 'wi-7',
    title: 'T22',
    version: 'v1.1',
    description: 'Updated ESD grounding steps for rework station',
    author: 'Sara Willems',
    authorInitials: 'SW',
    updatedAt: 'June 6th',
    status: 'review',
  },
  {
    id: 'wi-8',
    title: 'T56',
    version: 'v2.3',
    description: 'Leak test procedure with revised pressure hold time',
    author: 'Jane Larsen',
    authorInitials: 'JL',
    updatedAt: 'June 5th',
    status: 'review',
  },
  {
    id: 'wi-9',
    title: 'Product T18',
    version: 'v0.9',
    description: 'Pre-ship visual inspection checklist',
    author: 'Marc Bakker',
    authorInitials: 'MB',
    updatedAt: 'June 7th',
    status: 'review',
  },
];

/** Build a mock archived version entry for read-only preview. */
function createArchivedEntry(
  id: string,
  version: string,
  description: string,
  author: string,
  authorInitials: string,
  updatedAt: string,
): VersionEntry {
  return {
    id,
    version,
    description,
    author,
    authorInitials,
    updatedAt,
    status: 'draft',
  };
}

/** Version history entries keyed by instruction id (wi-1, wi-2, …). */
export const INITIAL_VERSION_HISTORY: Record<string, VersionHistory> = {
  'wi-1': {
    totalVersions: 6,
    entries: [
      {
        id: 'v-1-live',
        version: 'v3.3',
        description: 'Live: bolt Y placement visuals and 4 Nm torque spec',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'May 28th',
        status: 'live',
      },
      {
        id: 'v-1-ready',
        version: 'v3.4',
        description: 'Raised torque to 4.5 Nm and added traveler sign-off',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'June 2nd',
        status: 'ready-to-publish',
      },
      {
        id: 'v-1-draft',
        version: 'v3.5',
        description: 'Drafting coolant line C reroute and clamp updates',
        author: 'Sara Willems',
        authorInitials: 'SW',
        updatedAt: 'June 5th',
        status: 'draft',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-1-arch-v3.0',
        'v3.0',
        'Initial T8 assembly sequence',
        'Jane Larsen',
        'JL',
        'April 12th',
      ),
      createArchivedEntry(
        'v-1-arch-v3.1',
        'v3.1',
        'Added fixture pin alignment check',
        'Jane Larsen',
        'JL',
        'May 3rd',
      ),
      createArchivedEntry(
        'v-1-arch-v3.2',
        'v3.2',
        'Bolt Y torque spec updated to 4 Nm',
        'Marc Bakker',
        'MB',
        'May 18th',
      ),
    ],
  },
  'wi-2': {
    totalVersions: 3,
    entries: [
      {
        id: 'v-2-live',
        version: 'v2.1',
        description: 'Added bracket jig L-14 and fastener pattern visual',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'May 20th',
        status: 'live',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-2-arch-v1.0',
        'v1.0',
        'First T28 bracket install procedure',
        'Jane Larsen',
        'JL',
        'March 8th',
      ),
      createArchivedEntry(
        'v-2-arch-v2.0',
        'v2.0',
        'Manual bracket alignment before jig L-14',
        'Jane Larsen',
        'JL',
        'April 22nd',
      ),
    ],
  },
  'wi-3': {
    totalVersions: 4,
    entries: [
      {
        id: 'v-3-ready',
        version: 'v1.3',
        description: 'Mandatory daily calibration and probe alignment visual',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'June 3rd',
        status: 'ready-to-publish',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-3-arch-v1.0',
        'v1.0',
        'Basic T10 probe alignment steps',
        'Marc Bakker',
        'MB',
        'April 1st',
      ),
      createArchivedEntry(
        'v-3-arch-v1.1',
        'v1.1',
        'Added lockout tag reminder',
        'Marc Bakker',
        'MB',
        'May 10th',
      ),
      createArchivedEntry(
        'v-3-arch-v1.2',
        'v1.2',
        'Optional calibration skip note',
        'Marc Bakker',
        'MB',
        'May 25th',
      ),
    ],
  },
  'wi-4': {
    totalVersions: 1,
    entries: [
      {
        id: 'v-4-draft',
        version: 'v0.4',
        description: 'First pass on graduated dispenser and SDS checklist',
        author: 'Sara Willems',
        authorInitials: 'SW',
        updatedAt: 'June 4th',
        status: 'draft',
      },
    ],
    archivedEntries: [],
  },
  'wi-5': {
    totalVersions: 2,
    entries: [
      {
        id: 'v-5-live',
        version: 'v2.0',
        description: 'Live: housing torque sequence with 6 Nm spec',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'June 1st',
        status: 'live',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-5-arch-v1.0',
        'v1.0',
        'Initial T12 assembly without torque driver callout',
        'Jane Larsen',
        'JL',
        'April 20th',
      ),
    ],
  },
  'wi-6': {
    totalVersions: 2,
    entries: [
      {
        id: 'v-6-live',
        version: 'v1.2',
        description: 'Live: harness routing with strain relief visual',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'May 30th',
        status: 'live',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-6-arch-v1.0',
        'v1.0',
        'Original cable routing without strain relief step',
        'Marc Bakker',
        'MB',
        'May 5th',
      ),
    ],
  },
  'wi-7': {
    totalVersions: 2,
    entries: [
      {
        id: 'v-7-ready',
        version: 'v1.1',
        description: 'Approved ESD wrist strap and mat verification steps',
        author: 'Sara Willems',
        authorInitials: 'SW',
        updatedAt: 'June 6th',
        status: 'ready-to-publish',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-7-arch-v1.0',
        'v1.0',
        'Basic grounding check without mat resistance test',
        'Sara Willems',
        'SW',
        'May 15th',
      ),
    ],
  },
  'wi-8': {
    totalVersions: 3,
    entries: [
      {
        id: 'v-8-ready',
        version: 'v2.3',
        description: 'Extended pressure hold from 30s to 45s after QA audit',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'June 5th',
        status: 'ready-to-publish',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-8-arch-v2.0',
        'v2.0',
        'Leak test at 30 second hold',
        'Jane Larsen',
        'JL',
        'May 8th',
      ),
      createArchivedEntry(
        'v-8-arch-v2.1',
        'v2.1',
        'Added pressure gauge photo reference',
        'Jane Larsen',
        'JL',
        'May 22nd',
      ),
    ],
  },
  'wi-9': {
    totalVersions: 2,
    entries: [
      {
        id: 'v-9-ready',
        version: 'v0.9',
        description: 'Pre-ship cosmetic and label placement checklist',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'June 7th',
        status: 'ready-to-publish',
      },
    ],
    archivedEntries: [
      createArchivedEntry(
        'v-9-arch-v0.8',
        'v0.8',
        'Draft inspection list without label alignment visual',
        'Marc Bakker',
        'MB',
        'June 1st',
      ),
    ],
  },
};

/** Pre-filled review notes for versions already approved before the session started. */
export function createInitialReviewComments(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(PUBLISH_DATA_BY_ENTRY).map(([entryId, data]) => [entryId, data.comment]),
  );
}

export function createInitialVersionsData(): VersionsDataState {
  return {
    instructions: structuredClone(INITIAL_INSTRUCTIONS),
    versionHistoryByInstruction: structuredClone(INITIAL_VERSION_HISTORY),
  };
}

/** Default operators shown on the Publish screen for Product T8. */
export const DEFAULT_OPERATORS_ON_SHIFT: OperatorOnShift[] = [
  {
    id: 'op-1',
    name: 'Stefan Witlox',
    initials: 'SW',
    assignment: 'Triage T-8',
  },
  {
    id: 'op-2',
    name: 'Tim Kuijpers',
    initials: 'TK',
    assignment: 'Triage T-8',
  },
];

/** Fallback preview steps (T8 v3.4 diff) when no entry-specific steps exist. */
export const DEFAULT_PREVIEW_STEPS: PreviewStep[] = [
  { type: 'normal', title: 'Step 1', content: 'Put on nitrile gloves and ESD wrist strap' },
  { type: 'normal', title: 'Step 2', content: 'Mount baseplate on fixture pins A1–A4' },
  {
    type: 'removed',
    title: 'Step 3 - REMOVED',
    content: 'Torque bolt Y to 4 Nm by feel at each corner',
  },
  {
    type: 'added',
    title: 'Step 3 - ADDED',
    content: 'Torque bolt Y to 4.5 Nm using calibrated driver (4x)',
  },
  {
    type: 'visual',
    title: 'Step 4 - Visual',
    content: 'Bolt Y placement — 4x E020425',
    badge: 'Visual',
  },
  {
    type: 'visual',
    title: 'Step 5 - Visual',
    content: 'Traveler sign-off field location',
    badge: 'Visual',
  },
];

/** Preview steps per version entry id — each instruction has its own sequence. */
export const PREVIEW_STEPS_BY_ENTRY: Record<string, PreviewStep[]> = {
  'v-1-live': [
    { type: 'normal', title: 'Step 1', content: 'Put on nitrile gloves and ESD wrist strap' },
    { type: 'normal', title: 'Step 2', content: 'Mount T8 baseplate on fixture pins A1–A4' },
    { type: 'normal', title: 'Step 3', content: 'Torque bolt Y to 4 Nm at each corner (4x)' },
    {
      type: 'visual',
      title: 'Step 4 - Visual',
      content: 'Bolt Y placement — 4x E020425',
      badge: 'Visual',
    },
    {
      type: 'visual',
      title: 'Step 5 - Visual',
      content: 'Fixture pin alignment check',
      badge: 'Visual',
    },
  ],
  'v-1-ready': DEFAULT_PREVIEW_STEPS,
  'v-1-draft': [
    { type: 'normal', title: 'Step 1', content: 'Put on PPE for coolant service' },
    { type: 'normal', title: 'Step 2', content: 'Depressurize and drain line C per lockout tag' },
    {
      type: 'visual',
      title: 'Step 3 - Visual',
      content: 'Coolant line C routing before reroute',
      badge: 'Visual',
    },
    { type: 'normal', title: 'Step 4', content: 'Route replacement line along bulkhead path' },
    {
      type: 'visual',
      title: 'Step 5 - Visual',
      content: 'New clamp placement at bulkhead entry',
      badge: 'Visual',
    },
  ],
  'v-2-live': [
    { type: 'normal', title: 'Step 1', content: 'Verify T28 serial on work order' },
    { type: 'normal', title: 'Step 2', content: 'Install left bracket using jig L-14' },
    {
      type: 'visual',
      title: 'Step 3 - Visual',
      content: 'Bracket orientation on mounting rail',
      badge: 'Visual',
    },
    { type: 'normal', title: 'Step 4', content: 'Secure with M6 fasteners (6x)' },
    {
      type: 'visual',
      title: 'Step 5 - Visual',
      content: 'Fastener pattern — top view',
      badge: 'Visual',
    },
  ],
  'v-3-ready': [
    { type: 'normal', title: 'Step 1', content: 'Power down station and apply lockout tag' },
    {
      type: 'removed',
      title: 'Step 2 - REMOVED',
      content: 'Skip calibration if last run was today',
    },
    {
      type: 'added',
      title: 'Step 2 - ADDED',
      content: 'Run full calibration routine before probe alignment',
    },
    { type: 'normal', title: 'Step 3', content: 'Align probe to reference plate' },
    {
      type: 'visual',
      title: 'Step 4 - Visual',
      content: 'Probe reference plate alignment',
      badge: 'Visual',
    },
    {
      type: 'added',
      title: 'Step 5 - ADDED',
      content: 'Add safety note: keep hands clear during auto-homing',
    },
  ],
  'v-4-draft': [
    { type: 'normal', title: 'Step 1', content: 'Review chemical SDS before handling solvent' },
    {
      type: 'removed',
      title: 'Step 2 - REMOVED',
      content: 'Pour solvent directly into bath until full',
    },
    {
      type: 'added',
      title: 'Step 2 - ADDED',
      content: 'Use graduated dispenser to the 200 ml mark',
    },
    {
      type: 'visual',
      title: 'Step 3 - Visual',
      content: 'Dispenser fill level marker',
      badge: 'Visual',
    },
    { type: 'normal', title: 'Step 4', content: 'Wipe station dry before next batch' },
  ],
  'v-5-live': [
    { type: 'normal', title: 'Step 1', content: 'Verify T12 work order and lot traceability' },
    { type: 'normal', title: 'Step 2', content: 'Seat housing on fixture pins H1–H4' },
    { type: 'normal', title: 'Step 3', content: 'Torque housing bolts to 6 Nm (8x)' },
    {
      type: 'visual',
      title: 'Step 4 - Visual',
      content: 'Bolt pattern — T12 housing top view',
      badge: 'Visual',
    },
  ],
  'v-6-live': [
    { type: 'normal', title: 'Step 1', content: 'De-energize panel and verify zero voltage' },
    { type: 'normal', title: 'Step 2', content: 'Route harness along guide clips C1–C6' },
    {
      type: 'visual',
      title: 'Step 3 - Visual',
      content: 'Strain relief orientation at bulkhead',
      badge: 'Visual',
    },
    { type: 'normal', title: 'Step 4', content: 'Secure tie-wraps at 150 mm intervals' },
  ],
  'v-7-ready': [
    { type: 'normal', title: 'Step 1', content: 'Inspect ESD wrist strap for wear or cracks' },
    {
      type: 'added',
      title: 'Step 2 - ADDED',
      content: 'Test mat resistance with ground meter (< 1 GΩ)',
    },
    { type: 'normal', title: 'Step 3', content: 'Connect wrist strap to ground point G4' },
    {
      type: 'visual',
      title: 'Step 4 - Visual',
      content: 'Ground point G4 location at rework bench',
      badge: 'Visual',
    },
  ],
  'v-8-ready': [
    { type: 'normal', title: 'Step 1', content: 'Connect test fixture and seal all ports' },
    {
      type: 'removed',
      title: 'Step 2 - REMOVED',
      content: 'Hold pressure at 2.5 bar for 30 seconds',
    },
    {
      type: 'added',
      title: 'Step 2 - ADDED',
      content: 'Hold pressure at 2.5 bar for 45 seconds',
    },
    { type: 'normal', title: 'Step 3', content: 'Record leak rate on traveler form' },
    {
      type: 'visual',
      title: 'Step 4 - Visual',
      content: 'Pressure gauge reading at hold midpoint',
      badge: 'Visual',
    },
  ],
  'v-9-ready': [
    { type: 'normal', title: 'Step 1', content: 'Remove protective film from display lens' },
    { type: 'normal', title: 'Step 2', content: 'Verify serial label matches work order' },
    {
      type: 'visual',
      title: 'Step 3 - Visual',
      content: 'Label placement within tolerance zone',
      badge: 'Visual',
    },
    { type: 'normal', title: 'Step 4', content: 'Sign off pre-ship checklist on traveler' },
  ],
};

export const DEFAULT_REVIEW_DATA: ReviewData = {
  author: 'Sara Willems',
  version: 'v3.5',
  date: 'June 5th',
  comment: '',
  checklist: [
    'Technically accurate and safe to follow',
    'Clear and correct visuals',
    'Simple language and contains active wording',
  ],
  previewSteps: DEFAULT_PREVIEW_STEPS,
};

export const DEFAULT_PUBLISH_DATA: PublishData = {
  author: 'Marc Bakker',
  version: 'v3.4',
  date: 'June 2nd',
  comment:
    'Raised bolt Y torque to 4.5 Nm after gauge audit. Traveler sign-off visual added at step 5.',
  previewSteps: DEFAULT_PREVIEW_STEPS,
  operatorsOnShift: DEFAULT_OPERATORS_ON_SHIFT,
};

export const DEFAULT_REJECTION_FEEDBACK: RejectionFeedback = {
  reviewerName: 'Stefan Witlox',
  reviewerInitials: 'SW',
  date: 'June 4th',
  role: 'Reviewer',
  tags: ['Technically incorrect', 'Incomplete'],
  feedback:
    'Step 4 needs a clear next step, otherwise they\'ll improvise. Also rephrase the language...',
};

export const DEFAULT_REJECTION_DATA: RejectionData = {
  author: 'Marc Bakker',
  version: 'v3.4',
  date: 'June 2nd',
  comment:
    'Raised bolt Y torque to 4.5 Nm after gauge audit. Traveler sign-off visual added at step 5.',
  previewSteps: DEFAULT_PREVIEW_STEPS,
  rejectionFeedback: DEFAULT_REJECTION_FEEDBACK,
};

/** Override review content for specific draft entries. */
export const REVIEW_DATA_BY_ENTRY: Record<string, ReviewData> = {
  'v-1-draft': {
    author: 'Sara Willems',
    version: 'v3.5',
    date: 'June 5th',
    comment: '',
    checklist: DEFAULT_REVIEW_DATA.checklist,
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-1-draft'],
  },
  'v-4-draft': {
    author: 'Sara Willems',
    version: 'v0.4',
    date: 'June 4th',
    comment: '',
    checklist: DEFAULT_REVIEW_DATA.checklist,
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-4-draft'],
  },
};

/** Override publish content for ready-to-publish entries. */
export const PUBLISH_DATA_BY_ENTRY: Record<string, PublishData> = {
  'v-1-ready': {
    author: 'Marc Bakker',
    version: 'v3.4',
    date: 'June 2nd',
    comment:
      'Raised bolt Y torque to 4.5 Nm after gauge audit. Traveler sign-off visual added at step 5.',
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-1-ready'],
    operatorsOnShift: DEFAULT_OPERATORS_ON_SHIFT,
  },
  'v-3-ready': {
    author: 'Marc Bakker',
    version: 'v1.3',
    date: 'June 3rd',
    comment:
      'Calibration can no longer be skipped between shifts. Probe alignment visual updated.',
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-3-ready'],
    operatorsOnShift: [
      { id: 'op-3', name: 'Stefan Witlox', initials: 'SW', assignment: 'Triage T-10' },
    ],
  },
  'v-7-ready': {
    author: 'Sara Willems',
    version: 'v1.1',
    date: 'June 6th',
    comment:
      'Mat resistance test is mandatory before any rework. Ground point G4 visual added.',
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-7-ready'],
    operatorsOnShift: [
      { id: 'op-4', name: 'Tim Kuijpers', initials: 'TK', assignment: 'Rework station' },
    ],
  },
  'v-8-ready': {
    author: 'Jane Larsen',
    version: 'v2.3',
    date: 'June 5th',
    comment:
      'Extended hold time per QA audit finding LF-2024-18. Gauge photo reference at 22s mark.',
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-8-ready'],
    operatorsOnShift: [
      { id: 'op-5', name: 'Stefan Witlox', initials: 'SW', assignment: 'Leak test cell' },
      { id: 'op-6', name: 'Marc Bakker', initials: 'MB', assignment: 'Leak test cell' },
    ],
  },
  'v-9-ready': {
    author: 'Marc Bakker',
    version: 'v0.9',
    date: 'June 7th',
    comment:
      'Label alignment visual replaces written tolerance note. Pre-ship sign-off moved to final step.',
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-9-ready'],
    operatorsOnShift: [
      { id: 'op-7', name: 'Sara Willems', initials: 'SW', assignment: 'Final inspection' },
    ],
  },
};
