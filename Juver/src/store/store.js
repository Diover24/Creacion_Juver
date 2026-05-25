import { configureStore } from '@reduxjs/toolkit';

import tripReducer from './slices/tripSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        trip: tripReducer,
        user: userReducer,
    },
});