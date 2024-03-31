import React, { useState, useEffect } from 'react';
import { SafeAreaView, Pressable, StyleSheet, Text, View, TextInput, Image, FlatList } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, getDoc, getDocs, query , orderBy, where} from 'firebase/firestore';

const Chat = () => {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('User data:', userData);
          setUserData(userData);
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (user) {
      fetchUserData();
    }
  }, [db, user]);

  // Fetch chats data and listen for real-time updates
// Fetch chats data and listen for real-time updates
useEffect(() => {
  const chatsCollectionRef = collection(db, 'Chats');
  const chatsQuery = query(chatsCollectionRef, where('UID', 'array-contains', user.uid)); // Tạo truy vấn với điều kiện

  const unsubscribeChats = onSnapshot(
    chatsQuery,
    (snapshot) => {
      const chatsMap = new Map();

      snapshot.docs.forEach(async (chatDoc) => {
        const chatData = chatDoc.data();
        const chatUIDs = chatData.UID.filter((uid) => uid !== user.uid);
        const otherUID = chatUIDs[0];
        console.log(otherUID);
        const userDocRef = doc(db, 'users', otherUID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          const messQuery = query(
            collection(db, 'Chats', chatData.UID_Chats, 'chat_mess'),
            orderBy('createdAt', 'desc')
          );

          // Listen for real-time updates for chat messages
        // Listen for real-time updates for chat messages
        const unsubscribeMessages = onSnapshot(messQuery, (messSnapshot) => {
          let latestMessage = null;
          if (!messSnapshot.empty) {
            latestMessage = messSnapshot.docs[0].data();
          }

          const chatItem = {
            ID_room: chatDoc.data().ID_roomChat,
            otherUser: {
              UID: userData.UID,
              name: userData.name,
              photoURL: userData.photoURL,
              userId: userData.userId
            },
            latestMessage: latestMessage
          };

          // Kiểm tra nếu có dữ liệu latestMessage trước khi thêm vào danh sách
          if (latestMessage) {
            // Update chatsMap with the new chat item
            chatsMap.set(chatItem.ID_room, chatItem);
          }

          // Convert map values to array and sort by latest message timestamp
          const sortedChats = Array.from(chatsMap.values()).sort((a, b) => {
            if (a.latestMessage && b.latestMessage) {
              return b.latestMessage.createdAt - a.latestMessage.createdAt;
            }
            return 0;
          });

          // Set the state with sorted chat items
          setChats([...sortedChats]);
        });

        return () => {
          // Unsubscribe the previous listener for chat messages
          unsubscribeMessages();
        };

        }
      });
    }
  );

  return () => {
    // Unsubscribe the previous listener for chats
    unsubscribeChats();
  };
}, [db, user]);

  
  
  

  // Render each chat item
  const renderItem = ({ item }) => (
    <Pressable style={styles.itemContainer} onPress={() => navigation.navigate("Chat_fr", { friendData: item.otherUser })}>
      <View style={styles.contentContainer}>
        <Image source={{ uri: item.otherUser.photoURL }} style={styles.avatar} />
        <View style={styles.messageContainer}>
          <Text style={styles.userName}>{item.otherUser.name}</Text>
          {item.latestMessage && (
            <View style={styles.latestMessageContent}>
              <Text style={styles.latestMessageText}>{item.latestMessage.text}</Text>
              <Text style={styles.latestMessageTimestamp}>
                {item.latestMessage.createdAt.toDate().toLocaleString()}
              </Text>
              <View style={styles.separator}></View>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="white" />
          <Pressable style={styles.searchInput} onPress={() => navigation.navigate("SearchFriend")}>
            <Text style={styles.textSearch}>Tìm kiếm</Text>
          </Pressable>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
          <Feather name="plus" size={30} color="white" />
        </View>
      </SafeAreaView>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.ID_room.toString() + '_' + item.otherUser.UID}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    justifyContent: "center",
    height: 48,
    marginLeft: 10,
  },
  textSearch: {
    color: "white",
    fontWeight: '500'
  }, 
  itemContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    width:'100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 25,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  latestMessageContent: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
  },
  latestMessageText: {
    fontSize: 14,
  },
  latestMessageTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#dcdcdc',
    width: '100%',
  },
});

export default Chat;
