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
};

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
};

export const DEFAULT_REVIEW_DATA: ReviewData = {
  author: 'Sara Willems',
  version: 'v3.5',
  date: 'June 5th',
  comment:
    'Coolant reroute needs clearer clamp torque callout. Added two visuals for line C and bulkhead entry.',
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
    comment:
      'Coolant reroute needs clearer clamp torque callout. Added two visuals for line C and bulkhead entry.',
    checklist: DEFAULT_REVIEW_DATA.checklist,
    previewSteps: PREVIEW_STEPS_BY_ENTRY['v-1-draft'],
  },
  'v-4-draft': {
    author: 'Sara Willems',
    version: 'v0.4',
    date: 'June 4th',
    comment:
      'First draft of dispenser workflow. Needs review on SDS step order and fill-level visual.',
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
};