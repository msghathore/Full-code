# NoHardcodedDataSkill.md

## CRITICAL RULE: No Hardcoded Data

**NEVER use hardcoded data** unless explicitly stated by user.

**ALWAYS fetch dynamically** from Supabase database.

## Examples

### ❌ WRONG (Hardcoded)
```typescript
const businessHours = "Daily: 8:00 AM - 11:30 PM";
const address = "283 Tache Avenue, Winnipeg, MB";
const services = [
  { name: "Haircut", price: 50 },
  { name: "Coloring", price: 120 }
];
```

### ✅ CORRECT (Dynamic)
```typescript
// Fetch from database
const { data: businessInfo } = useQuery({
  queryKey: ['business-info'],
  queryFn: () => supabase.from('business_settings').select('*').single()
});

const { data: services } = useQuery({
  queryKey: ['services'],
  queryFn: () => supabase.from('services').select('*')
});
```

## Common Violations to Fix

| Data Type | Source Table | Common Files |
|-----------|-------------|--------------|
| Business hours | `business_settings` | Contact.tsx, Booking.tsx |
| Address/phone | `business_settings` | Contact.tsx, Footer.tsx |
| Service prices | `services` | Services.tsx, Booking.tsx |
| Time slots | `business_settings` | Booking.tsx, Calendar.tsx |
| Staff info | `staff` | Team.tsx, StaffList.tsx |
| Product data | `products` | Shop.tsx, ProductCard.tsx |

## Migration Strategy

When you encounter hardcoded data:

1. **Identify** the hardcoded values
2. **Create/verify** database table exists
3. **Add migration** if table/columns missing
4. **Fetch dynamically** using React Query
5. **Remove** hardcoded values
6. **Verify** data displays correctly

## Audit Reference

See `TECHNICAL_DEBT.md` for full list of files with hardcoded data that need fixing.
