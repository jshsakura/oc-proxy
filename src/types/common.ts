import { SnackbarOrigin } from '@mui/joy/Snackbar';
export type Order = 'asc' | 'desc'
export type SnackbarColor= 'primary' | 'neutral' | 'danger' | 'success' | 'warning';

export interface BypassResponse {
  original_link: string,
  bypassed_link: string,
}

export interface SnackbarState extends SnackbarOrigin {
  open: boolean;
  message: string;
  color: SnackbarColor;
}