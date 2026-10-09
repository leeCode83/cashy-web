/**
 * Toast context — separate file so fast refresh only sees the provider
 * component. `useToast` is the only way screens raise a toast.
 */
import { createContext, useContext } from 'react'

/** Internal context carrying the show function; see {@link ToastProvider}. */
export const ToastContext = createContext<(text: string) => void>(() => {})

/**
 * Show a short success/info confirmation from anywhere in the tree.
 * Never call for errors — errors must not disappear on their own.
 */
export function useToast(): (text: string) => void {
  return useContext(ToastContext)
}
