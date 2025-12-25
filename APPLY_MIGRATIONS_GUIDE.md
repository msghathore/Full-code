# How to Apply Service Reorganization

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Log in if needed
3. Click on your "Zavira" project

### Step 2: Open SQL Editor
1. Click "SQL Editor" in the left sidebar
2. Click "+ New query" button

### Step 3: Run First Migration (Add Columns)

Copy and paste this into the SQL editor and click "Run":

```sql
-- Add parent_service_id column to support service variants
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS parent_service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_services_parent ON public.services(parent_service_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);
```

You should see "Success. No rows returned" or similar.

### Step 4: Verify First Migration

Click "+ New query" and run this to verify the columns were added:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services'
AND column_name IN ('parent_service_id', 'display_order', 'is_parent');
```

You should see 3 rows showing these columns exist.

### Step 5: Run Second Migration (Update Services)

1. Click "+ New query" again
2. Open this file in a text editor:
   `C:\Users\Ghath\OneDrive\Desktop\Zavira-Front-End\supabase\migrations\20251222_seed_services_with_variants.sql`
3. Select ALL the content (Ctrl+A)
4. Copy it (Ctrl+C)
5. Paste it into the Supabase SQL Editor
6. Click "Run"

This will delete all existing services and create the new organized structure.

### Step 6: Verify Services Were Created

Run this query to see the new structure:

```sql
SELECT
    name,
    category,
    is_parent,
    CASE
        WHEN is_parent THEN '(Parent)'
        WHEN parent_service_id IS NOT NULL THEN '  → (Variant)'
        ELSE '(Standalone)'
    END as type,
    price,
    display_order
FROM public.services
WHERE category = 'Hair'
ORDER BY display_order, parent_service_id NULLS FIRST;
```

You should see services organized like:
- Women's Haircut (Parent) - $0.00
  → Short Hair (Variant) - $65.00
  → Medium Hair (Variant) - $75.00
  → Long Hair (Variant) - $85.00

### Step 7: Test the Website

1. Open https://zavira.ca/services
2. You should now see:
   - Services grouped by parent categories
   - Variants indented under each parent
   - "X options available" for parent services
   - Clean, organized structure

## Troubleshooting

**If Step 3 fails with "column already exists":**
- The migration was already partially run
- Skip to Step 5

**If Step 5 fails:**
- Check the error message
- Make sure you copied the ENTIRE file content
- Try running it in smaller sections

**If services don't show on website:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console for errors (F12)

## Still Having Issues?

Run this diagnostic query:

```sql
SELECT
    category,
    COUNT(*) as total_services,
    COUNT(*) FILTER (WHERE is_parent = true) as parent_services,
    COUNT(*) FILTER (WHERE parent_service_id IS NOT NULL) as variants
FROM public.services
GROUP BY category
ORDER BY category;
```

This shows how many services, parents, and variants exist in each category.
