import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Chat from './src/screens/Chat';
import StackNavigator from './src/navigation/StackNavigator';
import Bottomtab from './src/navigation/Bottomtab';

import Login from './src/screens/Login';

export default function App() {
  return (
    <StackNavigator/>
    // <Login></Login>
  );
}




// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./styles.css";
// import "zmp-ui/zaui.min.css";

// import App from "./App";
// import { SnackbarProvider } from "zmp-ui";

// const root = createRoot(document.getElementById("root"));
// root.render(
//   <StrictMode>
//     <SnackbarProvider>
//       <App />
//     </SnackbarProvider>
//   </StrictMode>
// );
