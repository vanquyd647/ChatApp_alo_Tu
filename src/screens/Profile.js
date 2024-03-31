import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Image, TouchableOpacity } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

export default function Profile({ setIsLoggedIn }) {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  const auth = getAuth();
  const firestore = getFirestore();
 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setDisplayName(user.displayName);
        fetchPhotoURL(user.uid);
      } else {
        setDisplayName('');
        setPhotoURL(null);
      }
    });

    return unsubscribe;
  }, []);

  // Method hiện thị ảnh cá nhân
  const fetchPhotoURL = async (userId) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log(userData)
        setPhotoURL(userData.photoURL);
      }
    } catch (error) {
      console.error("Error fetching photo URL: ", error);
    }
  };

  // Nút đăng xuất
  const onHandleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        Alert.alert(
          'Logout success',
          'You have logged out successfully!',         
        );
      })
      .catch((err) => Alert.alert("Logout error", err.message));
  };

  // Cập nhật ảnh đại diện
  const handleUpdatePhoto = async () => {
    try {
      // Chọn ảnh mới từ thư viện ảnh trên thiết bị
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
         console.log(result);
      if (!result.cancelled) {
        // Nếu người dùng chọn ảnh, tiến hành cập nhật
        const Ure = result.assets[0].uri
        console.log("URI before fetch:", Ure);
        // Xóa ảnh hiện tại trên Firebase Storage và cập nhật URL ảnh mới
        await deletePreviousPhoto(auth.currentUser.uid);
        
        // Tải ảnh mới lên Firebase Storage và cập nhật URL ảnh mới
        const newPhotoURL = await uploadImageAsync(Ure, auth.currentUser.uid);
        
        if (newPhotoURL) {
          // Cập nhật URL ảnh mới vào Firestore chỉ khi có giá trị hợp lệ
          await updatePhotoURL(newPhotoURL, auth.currentUser.uid);
          
          // Cập nhật trạng thái hiển thị của ảnh trên ứng dụng
          setPhotoURL(newPhotoURL);
        } else {
          // Xử lý khi không có URL ảnh mới
          console.error("No valid URL for the new photo.");
        }
      }
    } catch (error) {
      console.error("Error updating photo: ", error);
    }
  };
  
  // xóa ảnh đã setup trước đó
  const deletePreviousPhoto = async (userId) => {
    try {
      // Lấy URL ảnh hiện tại từ Firestore
      const userRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentPhotoURL = userData.photoURL;
  
        // Nếu có URL ảnh hiện tại, xóa ảnh đó trên Firebase Storage
        if (currentPhotoURL) {
          const storage = getStorage();
          const photoRef = ref(storage, currentPhotoURL);
          await deleteObject(photoRef);
  
          // Xóa URL ảnh trong tài liệu của người dùng trong Firestore
          await setDoc(userRef, { photoURL: null }, { merge: true });
        }
      }
    } catch (error) {
      console.error("Error deleting previous photo: ", error);
    }
  };
  
  // Method tải ảnh lên storage
  const uploadImageAsync = async (ure, userId) => {
    try {
      if (!ure) {
        throw new Error("URI của hình ảnh không xác định hoặc là null");
      }
  
      const storage = getStorage();
      const filename = `photos/${userId}/${Date.now()}`;
  
      // Lấy dữ liệu hình ảnh
      const response = await fetch(ure);
  
      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu hình ảnh");
      }
  
      // Chuyển đổi dữ liệu hình ảnh thành blob
      const blob = await response.blob();
  
      // Tải blob lên Firebase Storage
      const photoRef = ref(storage, filename);
      await uploadBytes(photoRef, blob);
  
      // Lấy URL của hình ảnh đã tải lên
      const downloadURL = await getDownloadURL(photoRef);
      return downloadURL;
    } catch (error) {
      console.error("Lỗi khi tải lên hình ảnh: ", error);
      throw error; // Ném lỗi ra ngoài
    }
  };
  
// Method cập nhật đường dẫn ảnh mới vào firestore
const updatePhotoURL = async (newURL, userId) => {
  try {
    // Cập nhật URL ảnh mới vào Firestore
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, { photoURL: newURL }, { merge: true });
  } catch (error) {
    console.error("Error updating photo URL: ", error);
  }
};
  


  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {displayName}</Text>
      <TouchableOpacity onPress={handleUpdatePhoto}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />

        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <Button title="Logout" onPress={onHandleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    backgroundColor: "#E1E2E6",
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 16,
    color: "#8E8E93",
  },
});
