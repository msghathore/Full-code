-- Remove redundant prefixes from service names
-- Since services are already grouped under category headings,
-- the category name in each service title is redundant

-- Massage: Remove "Massage Therapy - "
UPDATE services
SET name = REPLACE(name, 'Massage Therapy - ', '')
WHERE category = 'Massage'
  AND name LIKE 'Massage Therapy - %';

-- Eyebrow: Remove "Eyebrow Services - "
UPDATE services
SET name = REPLACE(name, 'Eyebrow Services - ', '')
WHERE category = 'Eyebrow'
  AND name LIKE 'Eyebrow Services - %';

-- Lash: Remove "Lash Services - "
UPDATE services
SET name = REPLACE(name, 'Lash Services - ', '')
WHERE category = 'Lash'
  AND name LIKE 'Lash Services - %';

-- Tattoo: Remove "Tattoo Services - "
UPDATE services
SET name = REPLACE(name, 'Tattoo Services - ', '')
WHERE category = 'Tattoo'
  AND name LIKE 'Tattoo Services - %';

-- Sugaring: Remove "Sugaring - "
UPDATE services
SET name = REPLACE(name, 'Sugaring - ', '')
WHERE category = 'Sugaring'
  AND name LIKE 'Sugaring - %';
