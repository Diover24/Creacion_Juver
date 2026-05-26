import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    origin: null,
    destination: null,
    tripInfo: null,
    selectedVehicle: null,
    isTripRequested: false,
    tripNotes: '',
    loading: false,
    error: null,
};

const tripSlice = createSlice({
    name: 'trip',
    initialState,
    reducers: {
        setOrigin: (state, action) => {
            state.origin = action.payload;
        },
        setDestination: (state, action) => {
            state.destination = action.payload;
        },
        setTripInfo: (state, action) => {
            state.tripInfo = action.payload;
        },
        setSelectedVehicle: (state, action) => {
            state.selectedVehicle = action.payload;
        },
        setIsTripRequested: (state, action) => {
            state.isTripRequested = action.payload;
        },
        setTripNotes: (state, action) => {
            state.tripNotes = action.payload;
        },
        setTripLoading: (state, action) => {
            state.loading = action.payload;
        },
        setTripError: (state, action) => {
            state.error = action.payload;
        },
        resetTrip: () => {
            return initialState;
        },
    },
});

export const {
    setOrigin,
    setDestination,
    setTripInfo,
    setSelectedVehicle,
    setIsTripRequested,
    setTripNotes,
    setTripLoading,
    setTripError,
    resetTrip,
} = tripSlice.actions;

export default tripSlice.reducer;
