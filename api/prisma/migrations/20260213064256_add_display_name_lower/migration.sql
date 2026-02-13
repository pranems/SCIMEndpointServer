/*
  Warnings:

  - Added the required column `displayNameLower` to the `ScimGroup` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScimGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpointId" TEXT NOT NULL,
    "scimId" TEXT NOT NULL,
    "externalId" TEXT,
    "displayName" TEXT NOT NULL,
    "displayNameLower" TEXT NOT NULL,
    "rawPayload" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScimGroup_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScimGroup" ("createdAt", "displayName", "displayNameLower", "endpointId", "externalId", "id", "meta", "rawPayload", "scimId", "updatedAt") SELECT "createdAt", "displayName", LOWER("displayName"), "endpointId", "externalId", "id", "meta", "rawPayload", "scimId", "updatedAt" FROM "ScimGroup";
DROP TABLE "ScimGroup";
ALTER TABLE "new_ScimGroup" RENAME TO "ScimGroup";
CREATE INDEX "ScimGroup_endpointId_idx" ON "ScimGroup"("endpointId");
CREATE UNIQUE INDEX "ScimGroup_endpointId_scimId_key" ON "ScimGroup"("endpointId", "scimId");
CREATE UNIQUE INDEX "ScimGroup_endpointId_externalId_key" ON "ScimGroup"("endpointId", "externalId");
CREATE UNIQUE INDEX "ScimGroup_endpointId_displayNameLower_key" ON "ScimGroup"("endpointId", "displayNameLower");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
