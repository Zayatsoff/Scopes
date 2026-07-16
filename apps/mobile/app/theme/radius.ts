/**
  Corner-radius scale. Softer than the old flat 3px boxes -> warmer, friendlier
  surfaces w/o losing the dense civic-utility feel. Consistent across themes.
 */
export const radius = {
  xs: 6, // chips, small controls
  sm: 10, // inputs, buttons
  md: 14, // content cards (news, alerts, summaries)
  lg: 20, // large containers, sheets
  pill: 999, // fully rounded pills / avatars
} as const
