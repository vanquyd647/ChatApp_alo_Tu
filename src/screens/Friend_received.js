import React, { useState, useEffect } from 'react';
import { SafeAreaView, Pressable, StyleSheet, Text, View, TextInput, Image, FlatList } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const Friend_received = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [userFriendsList, setUserFriendsList] = useState([]);

  const fetchUserFriends = async () => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const friendsCollectionRef = collection(userDocRef, "friend_Receiveds");

          // lắng nghe thay đổi từ firestore
          const unsubscribe = onSnapshot(friendsCollectionRef, (snapshot) => {
            const userFriends = [];
            snapshot.forEach((doc) => {
              const friend_Receiveds = doc.data();
              userFriends.push({
                id: doc.id,
                name: friend_Receiveds.name_fr,
                photoUrl: friend_Receiveds.photoURL_fr,
                userId: friend_Receiveds.userId_fr,
                UID: friend_Receiveds.UID_fr
              });
            });
            setUserFriendsList(userFriends); // cập nhật danh sách hiện thị
          });

          return () => unsubscribe(); // hủy việc lắng nghe
        } else {
          console.error("User document does not exist!");
        }
      } else {
        console.error("No user signed in!");
      }
    } catch (error) {
      console.error("Error fetching user friends:", error);
    }
  };

  useEffect(() => {
    fetchUserFriends();
  }, []);

  const handleAddFriend = async (friend) => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const friendData = {
            name_fr: friend.name,
            photoURL_fr: friend.photoUrl,
            userId_fr: friend.userId,
            UID_fr: friend.UID
          };

          // thêm bạn bè vào friendData Firebase will automatically create a unique ID
          await addDoc(collection(userDocRef, "friendData"), friendData);

          console.log("Friend added successfully!");

          // Xóa hồ sơ đã nhận 
          const friendReceivedDocRef = doc(userDocRef, "friend_Receiveds", friend.id);
          await deleteDoc(friendReceivedDocRef);

          console.log("Friend request removed from friend_Receiveds");

          // Cập nhật bạn bè vào thông tin người gửi
          const friendDocRef = doc(db, "users", friend.UID);
          
          const friendDocSnapshot = await getDoc(friendDocRef);
          if (friendDocSnapshot.exists()) { 
            const friendData = {
              name_fr: userData.name,
              photoURL_fr: userData.photoURL,
              userId_fr: userData.userId,
              UID_fr: userData.UID
            };
            await addDoc(collection(friendDocRef, "friendData"), friendData);
            console.log("Profile information added to friendData of the sender");
            
            // xóa hồ sơ dã gửi lời mời , từ người gửi
            const friendSentCollectionRef = collection(friendDocRef, "friend_Sents");
            const friendSentQuery = query(friendSentCollectionRef, where("UID_fr", "==", user.uid));
            const friendSentQuerySnapshot = await getDocs(friendSentQuery);
            friendSentQuerySnapshot.forEach(async (friendSentDoc) => {
              await deleteDoc(friendSentDoc.ref);
              console.log("Friend request removed from friend_Sents");
            });
          } else {
            console.error("Friend document does not exist!");
          }
          
          // Update the friends list after adding a new friend
          fetchUserFriends();
        } else {
          console.error("User document does not exist!");
        }
      } else {
        console.error("No user signed in!");
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const renderUserFriendItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Pressable>
        <Image style={styles.image} source={{ uri: item.photoUrl }} />
        <Text style={styles.text}>{item.name}</Text>
      </Pressable>
      <Pressable style={styles.addButton} onPress={() => handleAddFriend(item)}>
        <Text style={styles.addButtonText}>Add Friend</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View>
          <FlatList
            data={userFriendsList}
            renderItem={renderUserFriendItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginTop: 20,
    flex: 1,
    margin: 20,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  text: {
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#006AF5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Friend_received;
