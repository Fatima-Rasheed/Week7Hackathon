import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface SettingsState {
  activeSection: string;
}

const initialState: SettingsState = { activeSection: 'products' };

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setActiveSection(state, action: PayloadAction<string>) {
      state.activeSection = action.payload;
    },
  },
});

export const { setActiveSection } = settingsSlice.actions;
export const selectActiveSection = (state: RootState) => state.settings.activeSection;
export default settingsSlice.reducer;
