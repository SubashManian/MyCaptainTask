import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [group, setGroup] = useState(route.params?.group);
  const [user, setUser] = useState(route.params?.user);

  const userPresent = group?.users && group?.users.some(ele => ele?.id === user?.uid);

  useEffect(() => {
    const sub = firestore().collection('Messages').where('groupId', '==', group?.key)
    .orderBy('createdAt', 'desc')
    .onSnapshot(querySnapshot => {
      const msg = [];
      if (querySnapshot) {
        querySnapshot.forEach(doc => {
          msg.push({
            ...doc.data(),
            key: doc.id
          });
        });
        setMessages(msg);
      }
    });

    return () => sub();
  }, [text]);

  const sendMessage = async () => {
    if (text.trim() === '') {
      return;
    }

    await firestore()
      .collection('Messages')
      .add({
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdById: user.uid,
        group: group?.group,
        groupId: group?.key,
        message: text,
        username: user.email.split('@')[0],
      }).then(value => {
        value?.onSnapshot(snap => {
          firestore()
          .collection('Search_index')
          .add({
            messageRefId: snap.id,
            type: 'Messages',
            searchQuery: snap?.data().message,
            group: snap?.data().group,
            groupRefId: snap?.data().groupId
          })
        })
      });

    setText('');
  };
  
  const joinGroup = async () => {
    await firestore()
      .collection('Groups')
      .doc(group.key)
      .update({
        users: firestore.FieldValue.arrayUnion({email: user?.email, id: user?.uid})
      }).then(async() => {
        await firestore()
          .collection('Groups')
          .doc(group.key)
          .get()
          .then(snapshot => {
            setGroup({...snapshot.data(), key: snapshot.id});
          })
          .catch(err => {
            console.log('Error getting documents', err);
          });
      })
  };

  const renderItem = ({ item }) => {
    const dateTime = new Date(item?.createdAt.seconds * 1000);
    const dateDisplay = dateTime.getDate() === new Date().getDate() 
      ? moment(dateTime).format('LT')
      : moment(dateTime).format('MMM Do LT')

    const alignment = item?.createdById === user?.uid;
    return (
      <View style={{paddingBottom: 2, alignSelf: alignment ? 'flex-end' : 'flex-start'}}>
        <View style={{flexDirection: 'row', alignSelf: alignment ? 'flex-end' : 'flex-start'}}>
          <Text style={{fontSize: 10, paddingRight: 10}}>{item?.username}</Text>
          <Text style={{fontSize: 10}}>{dateDisplay}</Text>
        </View>
        <View key={item?.key} style={[styles.messageContainer, {alignSelf: alignment ? 'flex-end' : 'flex-start'}]}>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      </View>
    );
  }

  const onBackPress = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.logouttitle}>Back</Text>
        </TouchableOpacity>
        <View style={{flex:1, alignItems: 'center'}}>
          <Text style={styles.title}>{group?.group}</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{flex:1, paddingTop: 5}}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
          inverted
          style={{paddingLeft: 10, paddingRight: 10}}
        />
        {userPresent ? (<View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={text}
            placeholderTextColor={'black'}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{fontSize: 14}}>Send</Text>
          </TouchableOpacity>
        </View>) : (
          <View>
            <TouchableOpacity style={styles.joinButton} onPress={joinGroup}>
              <Text style={{fontSize: 14}}>Join</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e2d2d',
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    maxWidth: '80%',
    backgroundColor: '#616161',
    borderRadius: 8,
    padding: 5,
    marginVertical: 4,
  },
  message: {
    fontSize: 16,
    color: 'white'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    fontSize: 16,
    color: 'black',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6200ee',
    padding: 10,
    width: '100%'
  },
  title: {
    paddingRight: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logouttitle: {
    fontSize: 13,
    fontWeight: '200',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 8
  },
  joinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    width: 80,
    alignSelf: 'center',
    alignItems: 'center'
  }
});

export default ChatScreen;