import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
