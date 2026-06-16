/** URL paths for the Versions section and Instruction Builder deep links. */

export type VersionsWorkflowAction = 'review' | 'publish' | 'rejection' | 'view';

export const appRoutes = {
  bugReports: '/bug-reports',
  versions: '/versions',
  builder: '/all-instructions',
  settings: '/settings',
} as const;

export function versionHistoryPath(instructionId: string): string {
  return `/versions/${instructionId}`;
}

export function versionWorkflowPath(
  instructionId: string,
  action: VersionsWorkflowAction,
  entryId: string,
): string {
  return `/versions/${instructionId}/${action}/${entryId}`;
}

export function builderPath(instructionId: string, entryId?: string): string {
  return entryId
    ? `/all-instructions/${instructionId}/${entryId}`
    : `/all-instructions/${instructionId}`;
}

export function parseVersionsPath(pathname: string): {
  instructionId?: string;
  action?: VersionsWorkflowAction;
  entryId?: string;
} {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (segments[0] !== 'versions') {
    return {};
  }

  const instructionId = segments[1];
  const action = segments[2] as VersionsWorkflowAction | undefined;
  const entryId = segments[3];

  if (!instructionId) {
    return {};
  }

  if (!action) {
    return { instructionId };
  }

  const validActions: VersionsWorkflowAction[] = [
    'review',
    'publish',
    'rejection',
    'view',
  ];

  if (!validActions.includes(action) || !entryId) {
    return { instructionId };
  }

  return { instructionId, action, entryId };
}

export function parseBuilderPath(pathname: string): {
  instructionId?: string;
  entryId?: string;
} {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (segments[0] !== 'all-instructions') {
    return {};
  }

  return {
    instructionId: segments[1],
    entryId: segments[2],
  };
}

/** Which sidebar tab is active for a given pathname. */
export function sidebarTabFromPath(pathname: string): string {
  if (pathname.startsWith('/versions')) return 'versions';
  if (pathname.startsWith('/all-instructions')) return 'all-instructions';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'bug-reports';
}
