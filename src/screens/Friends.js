import React, { useState, useEffect } from 'react';
import { SafeAreaView, Pressable, StyleSheet, Text, View, TextInput, Image, FlatList } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, getDoc, getDocs } from "firebase/firestore";

const Friends = () => {
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
                    const friendsCollectionRef = collection(userDocRef, "friendData");
                    const friendsSnapshot = await getDocs(friendsCollectionRef);

                    const userFriends = [];
                    friendsSnapshot.forEach((doc) => {
                        const friendData = doc.data();
                        userFriends.push({
                            id: doc.id,
                            name: friendData.name_fr,
                            photoUrl: friendData.photoURL_fr,
                            userId: friendData.userId_fr,
                            UID_fr: friendData.UID_fr
                        });
                    });

                    setUserFriendsList(userFriends);
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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log(user);
                fetchUserFriends(); // Fetch friends when user is authenticated

                const db = getFirestore();
                const userDocRef = doc(db, "users", user.uid);
                const friendsCollectionRef = collection(userDocRef, "friendData");

                const unsubscribe = onSnapshot(friendsCollectionRef, (snapshot) => {
                    const userFriends = [];
                    let index = 0; // Bắt đầu với index = 0
                    snapshot.forEach((doc) => {
                        const friendData = doc.data();
                        userFriends.push({
                            id: index++, // Gán ID bằng index và tăng index sau mỗi lần sử dụng
                            name: friendData.name_fr,
                            photoUrl: friendData.photoURL_fr,
                            userId: friendData.userId_fr,
                            UID_fr: friendData.UID_fr
                        });
                    });
                    console.log(userFriends);
                    setUserFriendsList(userFriends); // Update friends list
                });
                

                return () => unsubscribe(); // Unsubscribe when component unmounts
            } else {
                console.log("No user signed in!");
            }
        });

        return unsubscribe;
    }, []);

    // Sort userFriendsList alphabetically by name
    const sortedUserFriendsList = userFriendsList.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    const renderUserFriendItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Pressable>
                <Image style={styles.image} source={{ uri: item.photoUrl }} />
                <Text style={styles.text}>{item.name}</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View>
                    <Pressable onPress={() => navigation.navigate("FriendRequest")}>
                        <View style={styles.view1}>
                            <FontAwesome5 name="user-friends" size={24} color="#006AF5" />
                            <Text style={styles.text1}>Lời mời kết bạn</Text>
                        </View>
                    </Pressable>
                    <View style={styles.view1}>
                        <FontAwesome6 name="contact-book" size={30} color="#006AF5" />
                        <Text style={styles.text1}>Danh bạ máy</Text>
                    </View>
                </View>

                <View>
                    <FlatList
                        data={sortedUserFriendsList}
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
    view1: {
        flexDirection: 'row',
        margin: 10,
    },
    text1: {
        fontSize: 15,
        justifyContent: "center",
        marginLeft: 10
    }
});

export default Friends;
