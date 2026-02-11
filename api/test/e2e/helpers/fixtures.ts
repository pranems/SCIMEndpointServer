/**
 * Fixture factories for E2E tests.
 *
 * Every factory returns a fresh object with unique values (using a counter)
 * and accepts an `overrides` spread so individual tests can tweak fields.
 */

let counter = 0;

function nextId(): number {
  return ++counter;
}

/** Reset the counter between test suites if needed. */
export function resetFixtureCounter(): void {
  counter = 0;
}

// ────────────────────── Users ──────────────────────

export interface UserFixture {
  schemas: string[];
  userName: string;
  externalId?: string;
  active?: boolean;
  name?: { givenName?: string; familyName?: string };
  emails?: Array<{ value: string; type?: string; primary?: boolean }>;
  [key: string]: unknown;
}

export function validUser(overrides: Partial<UserFixture> = {}): UserFixture {
  const n = nextId();
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    userName: `e2euser${n}@example.com`,
    externalId: `ext-user-${n}`,
    active: true,
    name: { givenName: 'Test', familyName: `User${n}` },
    emails: [{ value: `e2euser${n}@example.com`, type: 'work', primary: true }],
    ...overrides,
  };
}

// ────────────────────── Groups ──────────────────────

export interface GroupFixture {
  schemas: string[];
  displayName: string;
  externalId?: string;
  members?: Array<{ value: string; display?: string }>;
  [key: string]: unknown;
}

export function validGroup(overrides: Partial<GroupFixture> = {}): GroupFixture {
  const n = nextId();
  return {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    displayName: `E2E Group ${n}`,
    ...overrides,
  };
}

// ────────────────────── PATCH Operations ──────────────────────

export interface PatchFixture {
  schemas: string[];
  Operations: Array<{ op: string; path?: string; value?: unknown }>;
}

export function patchOp(
  operations: Array<{ op: string; path?: string; value?: unknown }>,
): PatchFixture {
  return {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
    Operations: operations,
  };
}

// ────────────────────── Convenience shortcuts ──────────────────────

export function deactivateUserPatch(): PatchFixture {
  return patchOp([{ op: 'replace', path: 'active', value: false }]);
}

export function activateUserPatch(): PatchFixture {
  return patchOp([{ op: 'replace', path: 'active', value: true }]);
}

export function replaceDisplayNamePatch(displayName: string): PatchFixture {
  return patchOp([{ op: 'replace', path: 'displayName', value: displayName }]);
}

export function addMemberPatch(userId: string): PatchFixture {
  return patchOp([
    { op: 'add', path: 'members', value: [{ value: userId }] },
  ]);
}

export function removeMemberPatch(userId: string): PatchFixture {
  return patchOp([
    { op: 'remove', path: `members[value eq "${userId}"]` },
  ]);
}
