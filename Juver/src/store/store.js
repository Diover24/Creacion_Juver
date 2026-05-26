import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import tripReducer from './slices/tripSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        trip: tripReducer,
        payment: paymentReducer,
    },
});
