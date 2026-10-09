/**
 * The six feedback kinds shared by every status surface (brief §7.1).
 * Pending means the system is working; waiting means the user must act —
 * copy on screen must say which one is being waited on.
 */
export type StatusKind = 'success' | 'pending' | 'waiting' | 'warning' | 'error' | 'info'
