import React, { useState, createContext, useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Chat from '../screens/Chat'
import Diary from '../screens/TimeLine'
import Explore from '../screens/Discovery'
import Phonebook from '../screens/Phonebook'
import Profile from '../screens/Profile'    
import Login from '../screens/Login'
import Signup from '../screens/Signup'
import SearchFriend from '../screens/SearchFriend';
import FriendRequest from '../screens/FriendRequest';
import Chat_fr from '../screens/Chat_fr';

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';




const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Thêm trạng thái đăng nhập

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};


const Tab = createBottomTabNavigator();
function BottomTabs({ setIsLoggedIn }) {
    return (
      <Tab.Navigator screenOptions={{
          tabBarStyle:{
              backgroundColor:"white",
              position: "absolute",
              bottom:0,
              left:0,
              right:0,
              
              borderTopWidth:0 
          }
      }}>
        <Tab.Screen
        name="Tin nhắn"
        component={Chat}
        options={{
            headerShown: false,
            tabBarIcon: ({ focused }) =>
            focused ? (
                <FontAwesome name="comment" size={24}  color="#006AF5"/>
            ) : (
                <FontAwesome name="comment-o" size={24} color="black" />
            ),           
        }}
        />
        <Tab.Screen
          name="Danh bạ"
          component={Phonebook}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) =>
            focused ? (
                <FontAwesome name="address-book" size={24} color="#006AF5" />
            ) : (
                <FontAwesome name="address-book-o" size={24} color="black" />
            ),                       
        }}
        />
        <Tab.Screen
          name="Khám phá"
          component={Explore}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) =>
            focused ? (
                <Feather name="more-horizontal" size={24} color="#006AF5" />
            ) : (
                <Feather name="more-horizontal" size={24} color="black" />
            ),                     
        }}
        />
        <Tab.Screen
          name="Nhật ký"
          component={Diary}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) =>
            focused ? (
                <MaterialCommunityIcons name="clock" size={24} color="#006AF5" />
            ) : (
                <FontAwesome5 name="clock" size={24} color="black" />
            ),                       
        }}
        />
        <Tab.Screen
  name="Cá nhân"
  options={{
    headerShown: false,
    tabBarIcon: ({ focused }) =>
      focused ? (
        <FontAwesome name="user" size={24} color="#006AF5" />
      ) : (
        <FontAwesome name="user-o" size={24} color="black" />
      ),
  }}
>
  {props => <Profile {...props} setIsLoggedIn={setIsLoggedIn} />}
</Tab.Screen>
  
      </Tab.Navigator>
    );
  }

const Stack = createNativeStackNavigator();

const ChatStack =({ setIsLoggedIn })=>{
  return(
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {props => <BottomTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="SearchFriend" component={SearchFriend} options={{ headerShown: false }} />
      <Stack.Screen name="FriendRequest" component={FriendRequest} options={{ headerShown: false }} />
      <Stack.Screen name="Chat_fr" component={Chat_fr} options={{ headerShown: false }} />
      
</Stack.Navigator>

  )
}
const AuthStack = ({ setIsLoggedIn }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login'>
        {props => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name='Signup'>
        {props => <Signup {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};



function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (authenticatedUser) => {
        if (authenticatedUser && isLoggedIn) { // Chỉ xác thực khi isLoggedIn là true
          setUser(authenticatedUser);
          setIsLoading(false);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return unsubscribeAuth;
  }, [isLoggedIn]); // Theo dõi thay đổi của isLoggedIn

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <ChatStack setIsLoggedIn={setIsLoggedIn}/> : <AuthStack setIsLoggedIn={setIsLoggedIn} />} 
    </NavigationContainer>
  );
}




const StackNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthenticatedUserProvider>
      <RootNavigator setIsLoggedIn={setIsLoggedIn} />
    </AuthenticatedUserProvider>
  );
}
export default StackNavigator

