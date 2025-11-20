/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Entity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Entity_name_key" ON "Entity"("name");

-- CreateIndex
CREATE INDEX "Entity_name_idx" ON "Entity"("name");

-- CreateIndex
CREATE INDEX "EntityCategory_name_idx" ON "EntityCategory"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");
