# StatusColorsSkill.md

## Appointment Status Colors

| Status | Color | Tailwind Class | Hex |
|--------|-------|----------------|-----|
| **Requested** | Amber | `bg-amber-500` | `#f59e0b` |
| **Accepted** | Violet | `bg-violet-300` | `#c4b5fd` |
| **Confirmed** | Emerald | `bg-emerald-500` | `#10b981` |
| **Ready to Start** | Teal | `bg-teal-400` | `#2dd4bf` |
| **In Progress** | Violet | `bg-violet-500` | `#8b5cf6` |
| **Completed** | Indigo | `bg-indigo-500` | `#6366f1` |
| **Cancelled** | Rose | `bg-rose-500` | `#f43f5e` |
| **No Show** | Slate | `bg-slate-500` | `#64748b` |
| **Personal Task** | Fuchsia | `bg-fuchsia-600` | `#c026d3` |

## Usage

```typescript
const statusColorMap: Record<AppointmentStatus, string> = {
  requested: 'bg-amber-500',
  accepted: 'bg-violet-300',
  confirmed: 'bg-emerald-500',
  ready_to_start: 'bg-teal-400',
  in_progress: 'bg-violet-500',
  completed: 'bg-indigo-500',
  cancelled: 'bg-rose-500',
  no_show: 'bg-slate-500',
  personal_task: 'bg-fuchsia-600'
};
```

## Text Colors

For contrast, use:
- Light backgrounds (300-400): `text-slate-900`
- Dark backgrounds (500-600): `text-white`

## Consistency

These colors must be used consistently across:
- Calendar view
- Appointment cards
- Status badges
- Filters and legends
- Mobile views
