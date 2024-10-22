import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ColorState {
    currentColor: string;
}

const initialState: ColorState = {
    currentColor: 'miami',
};

export const colorSlice = createSlice({
    name: 'color',
    initialState,
    reducers: {
        setColor: (state, action) => {
            console.log("Color change confirmed", action.payload);
            state.currentColor = action.payload;
        },
    },
});

export const { setColor } = colorSlice.actions;  // Export the setColor action
export const selectCurrentColor = (state: { color: ColorState }) => state.color.currentColor;
export default colorSlice.reducer;
