/**
 * Maps a status kind to its icon, so chip, banner and status card can never
 * drift apart (brief §7.1: color never carries meaning alone — every status
 * has an icon and a text label).
 */
import { CheckCircle, Clock, HandPointing, Info, Warning, XCircle } from '@phosphor-icons/react'
import type { StatusKind } from './StatusKind.ts'

const ICONS = {
  success: CheckCircle,
  pending: Clock,
  waiting: HandPointing,
  warning: Warning,
  error: XCircle,
  info: Info,
} as const

/**
 * Render the icon for a status kind.
 *
 * @param props.kind - Which status this icon represents.
 * @param props.size - Icon size in px; defaults to 20.
 */
export function StatusIcon({ kind, size = 20 }: { kind: StatusKind; size?: number }) {
  const Icon = ICONS[kind]
  return <Icon size={size} weight="regular" aria-hidden />
}
