import React from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/redux/store';
import { AppNavigator } from './src/navigation/AppNavigator';

function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#38BDF8" />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
