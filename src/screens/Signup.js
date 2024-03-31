import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, Alert } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../../config/firebase';

export default function Signup({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const db = getFirestore();

  // Nút đăng kí
  const onHandleSignup = () => {
    if (email !== '' && password !== '' && name !== '') {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          updateProfile(userCredential.user, {
            displayName: name
          }).then(() => {
            // Lưu tên người dùng và UID vào Firestore
            setDoc(doc(db, "users", userCredential.user.uid), {
              name: name,
              UID: userCredential.user.uid, // Lưu UID
              userId: email // Lưu email nếu cần
            }).then(() => {
              setIsLoggedIn(false);
              Alert.alert(
                'Signup success',
                'You have signed up successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
              );
            }).catch((error) => {
              console.log("Error adding document: ", error);
            });
          }).catch((error) => {
            console.log("Update profile error: ", error);
          });
        })
        .catch((err) => Alert.alert("Signup error", err.message));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteSheet} />
      <View style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          autoCapitalize="words"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
          <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: '#006AF5', fontWeight: '600', fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#006AF5",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#006AF5',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
