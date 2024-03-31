import React, { useState, useEffect } from 'react';
import { SafeAreaView, Pressable, StyleSheet, Text, View, TextInput, Image, FlatList, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, getDocs , doc, setDoc, getDoc, addDoc} from "firebase/firestore";
import { getAuth} from "firebase/auth";

const SearchFriend = () => {
  const navigation = useNavigation();
  const [input, setInput] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for search
  const auth = getAuth();

  const handleInputChange = (text) => {
    setInput(text);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("User not logged in.");
        // You might want to navigate to the login screen here if not logged in
      }
    });

    return unsubscribe;
  }, []);

  const checkFriendshipStatus = async (UID) => {
    console.log(UID);
    try {
      const db = getFirestore();
      const currentUser = auth.currentUser;
      console.log(currentUser);
      const currentUserDocRef = doc(db, "users", currentUser.uid);
      const friendDataQuery = query(collection(currentUserDocRef, "friendData"), where("UID_fr", "==", UID));
      const friendDataSnapshot = await getDocs(friendDataQuery);
      return !friendDataSnapshot.empty; // Trả về true nếu có dữ liệu, ngược lại trả về false
    } catch (error) {
      console.error("Error checking friendship status:", error);
      return false; // Trả về false nếu có lỗi xảy ra
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true); // Set loading state to true while fetching data
      const db = getFirestore();

      const userQuery = query(collection(db, "users"), where("name", "==", input));
      const userSnapshot = await getDocs(userQuery);

      const foundFriends = [];
      const currentUser = auth.currentUser;
      let index = 0; // Bắt đầu với index = 0
      userSnapshot.forEach(doc => {
        const userData = doc.data(); 
        if (userData.UID !== currentUser.uid) {
          foundFriends.push({
            id: index++,
            name: userData.name,
            photoUrl: userData.photoURL,
            userId: userData.userId,
            UID: userData.UID
          });
        }
      });

      const updatedFriendsList = [];
      for (const friend of foundFriends) {
        const isFriend = await checkFriendshipStatus(friend.UID);
        updatedFriendsList.push({ ...friend, isFriend });
      }
      setFriendsList(updatedFriendsList);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false); // Set loading state back to false
    }
  };
  
  // nút thêm bạn
  const handleAddFriend = async (friend) => {
    try {
      const db = getFirestore();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const currentUserDocRef = doc(db, "users", currentUser.uid);
        const currentUserDocSnapshot = await getDoc(currentUserDocRef);

        if (currentUserDocSnapshot.exists()) {
          const currentUserData = currentUserDocSnapshot.data();

          const friendSentsQuery = query(collection(currentUserDocRef, "friend_Sents"), where("userId_fr", "==", friend.userId));
          const friendSentsSnapshot = await getDocs(friendSentsQuery);

          if (friendSentsSnapshot.empty) {
            const friend_Sents = {
              name_fr: friend.name,
              photoURL_fr: friend.photoUrl,
              userId_fr: friend.userId,
              UID_fr: friend.UID
            };
            await addDoc(collection(currentUserDocRef, "friend_Sents"), friend_Sents);
            console.log("Added friend request sent");

            const friendDocRef = doc(db, "users", friend.UID);
            const friendDocSnapshot = await getDoc(friendDocRef);

            if (friendDocSnapshot.exists()) {
              const friend_Receiveds = {
                name_fr: currentUserData.name,
                photoURL_fr: currentUserData.photoURL,
                userId_fr: currentUserData.userId,
                UID_fr: currentUserData.UID
              };
              await addDoc(collection(friendDocRef, "friend_Receiveds"), friend_Receiveds);
              console.log("Friend request sent successfully");
            } else {
              console.error("Friend document does not exist!");
            }
          } else {
            console.log("Friend request already sent");
          }
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

  const createChatRoom = async (friendData) => {
    try {
      const db = getFirestore();
      const currentUser = auth.currentUser;
  
      // Sắp xếp UID của hai người dùng theo thứ tự từ điển
      const sortedUIDs = [currentUser.uid, friendData.UID].sort();
  
      // Tạo reference cho document trong "Chats" collection
      const chatRoomRef = doc(db, "Chats", sortedUIDs.join("_"));
  
      // Lấy thông tin của phòng chat
      const chatRoomSnapshot = await getDoc(chatRoomRef);
  
      // Nếu phòng chat không tồn tại
      if (!chatRoomSnapshot.exists()) {
        const chatRoomId = generateRandomId();
        // Tạo một phòng chat mới
        await setDoc(chatRoomRef, {
          // Thêm thông tin phòng chat tại đây
          ID_roomChat: chatRoomId,
          UID: [currentUser.uid, friendData.UID],
          UID_Chats: sortedUIDs.join("_")
        });
        console.log("New chat room created:", friendData);

      }
  
      // Navigate to the chat screen
      navigation.navigate("Chat_fr", { friendData });
    } catch (error) {
      console.error("Error creating or navigating to chat room:", error);
    }
  };
  
  
  // Function to generate a random 6-digit ID
  const generateRandomId = () => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  


  const renderFriendItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Pressable onPress={() => createChatRoom(item)}> 
        <Image style={styles.image} source={{ uri: item.photoUrl }} />
        <Text style={styles.text}>{item.name}</Text>
      </Pressable>
      {!item.isFriend && (
        <Pressable style={styles.addButton} onPress={() => handleAddFriend(item)}>
          <Text style={styles.addButtonText}>Add Friend</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="white" />
          <TextInput
            style={styles.searchInput}
            value={input}
            onChangeText={handleInputChange}
            placeholder="..."
            placeholderTextColor="white"
          />
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#0d47a1' : '#006AF5',
                paddingHorizontal: 10,
                borderRadius: 5,
              },
              styles.searchButton
            ]}
            onPress={handleSearch}
          >
            <Text style={styles.textSearch}>Tìm bạn bè</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loadingIndicator} size="large" color="#006AF5" />
        ) : (
          <FlatList
            data={friendsList}
            renderItem={renderFriendItem}
            keyExtractor={item => item.id}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006AF5",
    padding: 9,
    height: 48,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 10,
    color: 'white',
  },
  searchButton: {
    paddingHorizontal: 10,
  },
  textSearch: {
    color: "white",
    fontWeight: '500'
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
  loadingIndicator: {
    marginTop: 20,
  },
});

export default SearchFriend;
