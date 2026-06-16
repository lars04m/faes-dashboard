import fs from 'fs';
import path from 'path';

const src = fs.readFileSync('src/components/Versions.tsx', 'utf8');
const lines = src.split('\n');

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const root = 'src/versions';

fs.writeFileSync(
  path.join(root, 'types.ts'),
  `// Version control domain types\n\n${slice(31, 152).replace(/^type /gm, 'export type ').replace(/^interface /gm, 'export interface ')}\n`,
);

const constantsBody = slice(194, 289)
  + '\n\nexport const REJECTION_REASON_OPTIONS = [\n  \'Technically incorrect\',\n  \'Incomplete\',\n  \'Unclear\',\n  \'Other\',\n] as const;\n';

fs.writeFileSync(
  path.join(root, 'constants.ts'),
  `import type { InstructionStatus, StatusFilter, VersionHistoryStatus } from './types';\n\n${constantsBody}`,
);

const mockStart = slice(293, 744);
fs.writeFileSync(
  path.join(root, 'mockData.ts'),
  `import type {\n  Instruction,\n  OperatorOnShift,\n  PreviewStep,\n  PublishData,\n  RejectionData,\n  ReviewData,\n  RejectionFeedback,\n  VersionEntry,\n  VersionHistory,\n  VersionsDataState,\n} from './types';\n\n${mockStart.replace(/^const /gm, 'export const ').replace(/^function create/g, 'export function create')}`,
);

const helpersBody = slice(748, 880)
  + '\n' + slice(884, 983).replace(/^function /gm, 'export function ');

fs.writeFileSync(
  path.join(root, 'helpers.ts'),
  `import type {\n  Instruction,\n  PublishConfirmDetails,\n  PublishData,\n  RejectionData,\n  ReviewData,\n  StatusFilter,\n  VersionEntry,\n  VersionHistory,\n  VersionsDataState,\n} from './types';\nimport {\n  DEFAULT_PREVIEW_STEPS,\n  DEFAULT_PUBLISH_DATA,\n  DEFAULT_REJECTION_DATA,\n  DEFAULT_REVIEW_DATA,\n  PREVIEW_STEPS_BY_ENTRY,\n  PUBLISH_DATA_BY_ENTRY,\n  REVIEW_DATA_BY_ENTRY,\n} from './mockData';\n\n${helpersBody.replace(/^function /gm, 'export function ')}`,
);

console.log('Split types, constants, mockData, helpers');
