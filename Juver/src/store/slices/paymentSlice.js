import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedProvider: null,
    selectedPaymentType: null,
    paymentStatus: 'idle',
    paymentError: null,
    loading: false,
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setSelectedProvider: (state, action) => {
            state.selectedProvider = action.payload;
        },
        setSelectedPaymentType: (state, action) => {
            state.selectedPaymentType = action.payload;
        },
        setPaymentStatus: (state, action) => {
            state.paymentStatus = action.payload;
        },
        setPaymentError: (state, action) => {
            state.paymentError = action.payload;
        },
        setPaymentLoading: (state, action) => {
            state.loading = action.payload;
        },
        resetPayment: () => {
            return initialState;
        },
    },
});

export const {
    setSelectedProvider,
    setSelectedPaymentType,
    setPaymentStatus,
    setPaymentError,
    setPaymentLoading,
    resetPayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;
