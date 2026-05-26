# Juver - Mobile Transport Application

Juver is a cross-platform mobile transportation application inspired by Uber, built with React Native CLI for Android and iOS. The app allows users to register, log in, search for destinations, view routes on a map, estimate fares, request trips, track an assigned driver, complete payments, review trip receipts, rate completed trips, and check trip history.

This project integrates Firebase, Google Maps APIs, Redux Toolkit, React Navigation, AsyncStorage, and a simulated payment gateway prepared for Stripe and Mercado Pago integrations.

---

## Main Features

### Onboarding Screen

The application includes a welcome onboarding flow that introduces the main features of Juver.

The onboarding explains:

- Trip requests
- Vehicle selection
- Payment options
- General app usage

The onboarding is shown only the first time the user opens the app. This behavior is managed using AsyncStorage.

---

### User Authentication and Profile

The application includes user registration, login, password recovery, and profile management using Firebase Authentication and Firebase Firestore.

User profile fields:

- Profile photo
- Full name
- Phone number
- Gender
- Email
- Preferred language: Spanish or English

The registration form includes validations for:

- Empty fields
- Email format
- Phone number format
- Maximum full name length
- Password length

---

### Smart Destination Search

The app allows users to search for destinations using Google Places Autocomplete.

Features:

- Real-time location suggestions
- Origin selection
- Destination selection
- Location search limited to Colombia
- Clear search option to reset the destination, route, vehicle, notes, and fare information

---

### Interactive Map

The map module uses Google Maps to display the user's current location, destination, and trip route.

Features:

- Current location rendering
- Destination marker
- Route drawing between origin and destination
- Automatic map adjustment based on selected coordinates
- Map cleanup after cancelling a search, cancelling a trip, or completing a trip

---

### Route Calculation

The application uses Google Directions API and Google Distance Matrix API to calculate:

- Estimated route
- Trip distance
- Estimated travel time

This information is used to calculate the estimated fare before requesting the trip.

---

### Vehicle Selection

Users can select one of the available vehicle categories:

- Economy
- XL
- Premium

Each vehicle category applies a different multiplier to the final fare.

---

### Trip Request

Users can request a trip after selecting:

- Origin
- Destination
- Vehicle category
- Optional driver notes

The app verifies if the user already has an active trip before creating a new one.

Trip data is stored in Firebase Firestore.

---

### Driver Assignment and Real-Time Tracking

The app simulates driver assignment using a predefined driver pool.

Features:

- Driver assignment based on selected vehicle category
- Driver information display
- Vehicle model display
- Vehicle license plate display
- Driver movement simulation on the map
- Animated marker tracking
- Trip status updates
- Simulated notifications such as “Your driver is on the way”

Trip states include:

- Pending
- Accepted
- In progress
- Payment pending
- Completed
- Cancelled

---

### Cancel Trip

The active trip screen allows the user to cancel a trip before it is completed.

The cancellation flow includes:

- Confirmation alert before cancelling
- Firestore trip status update to `cancelled`
- Redux trip state cleanup
- Active trip screen cleanup
- Map and route cleanup
- Cancelled trip registration in the history screen

Cancelled trips do not generate payment charges.

---

### Payment Gateway Simulation

The app includes a simulated payment gateway prepared for future real integrations with Stripe and Mercado Pago.

Available payment options:

- Stripe simulation
- Mercado Pago simulation
- Cash payment

For card payments, the app validates:

- Cardholder name
- Card number
- Expiration date
- CVV
- Credit card option
- Debit card option

The simulation does not process real payments. It updates the payment status in Firestore and marks the trip as completed after a successful payment.

Only necessary payment information is stored, such as:

- Payment provider
- Payment type
- Amount
- Payment status
- Card brand
- Last four digits of the card

Sensitive information such as the full card number, CVV, and expiration date is not stored.

---

### Trip Receipt

After a successful payment, the app displays a trip receipt.

The receipt includes:

- Total paid
- Payment provider
- Payment type
- Card brand and last four digits when applicable
- Origin
- Destination
- Distance
- Duration
- Vehicle type
- Driver name
- Vehicle license plate

---

### Trip Rating

After viewing the receipt, the user can rate the trip.

The rating feature includes:

- Star rating from 1 to 5
- Optional written comment
- Rating storage in Firebase Firestore
- Rating display in trip history when available

---

### Trip History

The history screen displays completed and cancelled trips.

Each completed trip record includes:

- Date
- Origin
- Destination
- Distance
- Duration
- Vehicle type
- Driver
- Vehicle license plate
- Total cost
- Payment status
- Rating and optional comment

Each cancelled trip record includes:

- Date
- Origin
- Destination
- Vehicle type
- Driver if assigned
- Cancelled status
- Cancellation message

---

### Global State Management

The application uses Redux Toolkit to manage global state across the app.

Redux is used to manage:

- User state
- Trip state
- Payment state
- Selected origin
- Selected destination
- Selected vehicle
- Trip notes
- Payment status
- Trip cleanup after cancelling or completing a flow

---

### Navigation

The application uses React Navigation.

Navigation structure includes:

- Authentication stack
- Bottom tab navigation
- Home screen
- Active trip screen
- Trip history screen
- Profile screen
- Payment screen
- Receipt screen

The Payment and Receipt screens are accessible through navigation but hidden from the bottom tab bar.

---

## Technologies Used

- React Native CLI
- JavaScript
- Firebase Authentication
- Firebase Firestore
- Google Maps API
- Google Places API
- Google Directions API
- Google Distance Matrix API
- Redux Toolkit
- React Redux
- React Navigation
- React Native Maps
- React Native Maps Directions
- React Native Vector Icons
- React Native Image Picker
- React Native AsyncStorage

---

## Project Structure

~~~txt
Juver/
└── src/
    ├── assets/
    ├── components/
    │   ├── CustomButton.js
    │   ├── CustomInput.js
    │   ├── LocationAutocomplete.js
    │   ├── MapComponent.js
    │   └── VehicleSelector.js
    ├── hooks/
    │   ├── useAuth.js
    │   └── useLocation.js
    ├── navigations/
    │   ├── AppNavigator.js
    │   ├── AuthStack.js
    │   └── TabNavigator.js
    ├── Screens/
    │   ├── Auth/
    │   │   ├── LoginScreen.js
    │   │   ├── ProfileScreen.js
    │   │   └── RegisterScreen.js
    │   ├── Home/
    │   │   └── HomeScreen.js
    │   ├── Onboarding/
    │   │   └── OnboardingScreen.js
    │   ├── Payments/
    │   │   ├── PaymentScreen.js
    │   │   └── ReceiptScreen.js
    │   └── Trips/
    │       ├── ActiveTripScreen.js
    │       └── TripHistoryScreen.js
    ├── services/
    │   ├── database.js
    │   ├── googleApiService.js
    │   └── paymentService.js
    ├── store/
    │   ├── slices/
    │   │   ├── userSlice.js
    │   │   ├── tripSlice.js
    │   │   └── paymentSlice.js
    │   └── store.js
    └── utils/
        ├── constants.js
        ├── driverPool.js
        ├── pricingHelper.js
        └── validations.js
~~~

---

## Installation

Clone the repository:

~~~bash
git clone <repository-url>
cd Juver
~~~

Install dependencies:

~~~bash
npm install
~~~

Start Metro:

~~~bash
npx react-native start --reset-cache
~~~

Run on Android:

~~~bash
npx react-native run-android
~~~

Run on iOS:

~~~bash
npx react-native run-ios
~~~

---

## Firebase Configuration

The app uses Firebase for:

- User authentication
- User profile storage
- Trip storage
- Payment status storage
- Trip rating storage
- Trip history storage

Required Firebase services:

- Firebase Authentication
- Cloud Firestore

The Firebase configuration must be properly connected to the React Native project using the corresponding Firebase setup files.

---

## Google API Configuration

The project requires a Google Maps API key with the following APIs enabled:

- Google Maps SDK
- Google Places API
- Google Directions API
- Google Distance Matrix API

The API key should be configured inside:

~~~txt
src/utils/constants.js
~~~

Example:

~~~js
export const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
~~~

---

## Payment Simulation

The payment module is a simulated implementation for academic purposes.

It represents the structure of a real payment gateway integration with:

- Stripe
- Mercado Pago
- Cash payment

No real money is charged.

The payment simulation validates card information and updates the trip status in Firestore after successful payment.

This structure is prepared to be replaced by a real payment integration using a secure backend and real payment provider APIs.

---

## Redux Store

The Redux store is located in:

~~~txt
src/store/store.js
~~~

Available slices:

~~~txt
src/store/slices/userSlice.js
src/store/slices/tripSlice.js
src/store/slices/paymentSlice.js
~~~

Redux helps share important state between screens without passing props manually.

---

## Good Practices Applied

- Modular folder structure
- Reusable components
- Custom hooks
- Global state management with Redux Toolkit
- Firebase as a non-relational database
- Form validations
- Separation of services and utilities
- Clear navigation structure
- Simulated payment gateway prepared for future real integration
- User interface texts in Spanish
- Code structure and naming mostly in English
- Sensitive payment data protection
- Map and state cleanup after completing, cancelling, or resetting flows

---

## Academic Notes

This application was developed as a mobile development academic project.

The payment gateway is simulated for educational purposes. The structure is prepared to support real Stripe or Mercado Pago integration in the future using a secure backend.

---

## Author

Developed by Diover Farley Sanchez Salazar as part of a mobile development project.