import { toast as rhToast } from 'react-hot-toast'

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined') navigator.vibrate?.(pattern)
}

export const toast = {
  success: (msg: string) => { vibrate(40); return rhToast.success(msg) },
  error:   (msg: string) => { vibrate([30, 20, 30]); return rhToast.error(msg) },
  loading: rhToast.loading,
  dismiss: rhToast.dismiss,
}
