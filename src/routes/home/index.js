import React, {useState, useEffect, useContext} from 'react';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Animated,
  TextInput
} from 'react-native';
import debounce from 'lodash/debounce';

import { storeData } from '../../utilis';
import GroupDialogBox from '../modal';
import FloatingButton from './component/FloatingButton';
import { MyContext } from '../../app';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [modalView, setModalView] = useState(false);
  const [groups, setGroups] = useState([]);
  const [messages, setMessage] = useState([]);
  const [data, setdata] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const slideAnimation = new Animated.Value(-100);
  const route = useRoute();
  const { isLoggedIn, logoutPress } = useContext(MyContext);

  const { userDetails } = route.params;

  useEffect(() => {
    const subscriber = firestore()
    .collection('Groups')
    .onSnapshot(querySnapshot => {
      const groupsData = [];
        querySnapshot.forEach(documentSnapshot => {
          groupsData.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        });
        setGroups(groupsData);
      });

    return () => subscriber();
  }, [isExpanded]);

  useEffect(() => {
    const subscriber = firestore().collection('Messages').where('group', '==', '')
    .onSnapshot(querySnapshot => {
      const messagesData = [];
      if (querySnapshot) {
        querySnapshot.forEach(documentSnapshot => {
          messagesData.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        });
      }
      setMessage(messagesData);
    });
    return () => subscriber();
  }, [isExpanded]);

  useEffect(() => {
    const data = [...groups, ...messages];
    setdata(data);
  }, [groups, messages])

  useEffect(() => {
    const searchQuery = debounce(() => {
      if (searchText.trim() != ''){
        firestore()
          .collection('Search_index')
          .where('searchQuery', '>=', searchText)
          .onSnapshot(querySnap => {
            console.log(querySnap);
            const searchList = [];
            if (querySnap) {
              querySnap.forEach(doc => {
                searchList.push(doc.data())
              })
            }
            setdata(searchList);
          })
      }
    }, 500);

    searchQuery();
    return searchQuery.cancel;
  }, [searchText]);

  const renderListItem = ({ item }) => {
    console.log(item);
    const group = item.group === '';
    return (
      <TouchableOpacity key={item.key} style={styles.renderStyle} onPress={() => {itemOnPress(item)}}>
        <View>
          <Image 
            source={group ? require('../../assets/user.png') : require('../../assets/user-group.png')}
            style={{ width: group ? 50 : 40, height: group ? 50 : 40, tintColor: group ? '' : 'white' }}
          />
        </View>
        <View style={{paddingLeft: 10}}>
          <Text style={{color: '#fff', fontSize: 18, fontWeight: '500'}}>{group ? item?.username : item?.group}</Text>
          <Text style={{color: '#fff', fontSize: 14, fontWeight: '300'}}>{group ? item?.message : item?.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const itemOnPress = (item) => {
    console.log(item);
    navigation.navigate('Chat', {group: item, user: userDetails});
  }

  const onLogout = async () => {
    await storeData('login', 'false');
    logoutPress();
  }

  const onPress = async (value) => {
    firestore()
      .collection('Groups')
      .add({
        group: value?.groupName,
        description: value?.description,
        users: [{
          id: userDetails?.uid,
          email: userDetails?.email,
        }]
      })
      .then((value) => {
        value?.onSnapshot(querysanp => {
          console.log(querysanp?.data());
          firestore()
          .collection('Search_index')
          .add({
            groupRefId: querysanp.id,
            searchQuery: querysanp?.data().group,
            type: 'Group',
          })
        })
        setModalView(false);
      });
  }

  const handleToggleSearch = () => {
    if (isExpanded) {
      Animated.timing(slideAnimation, {
        toValue: -100,
        useNativeDriver: true,
      }).start(() => {
        setIsExpanded(false);
        setSearchText('');
        setdata([]);
      });
    } else {
      setIsExpanded(true);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <View style={{flex:1, alignItems: 'center'}}>
          <Text style={styles.title}>Home</Text>
        </View>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logouttitle}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Animated.View
        style={{
          // transform: [{ translateY: slideAnimation }],
          height: isExpanded ? 40 : 0,
          overflow: 'hidden',
          marginBottom: 10,
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
        <TextInput
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchContainer}
        />
        <TouchableOpacity style={styles.searchCloseBtn} onPress={handleToggleSearch}>
          <Text style={styles.searchCloseText}>x</Text>
        </TouchableOpacity>
      </Animated.View>
      <FlatList
        data={data}
        renderItem={renderListItem}
      />
      <GroupDialogBox
        visible={modalView}
        onClose={()=>{setModalView(false)}}
        onSave={onPress}
      />
      <FloatingButton 
        addPress={()=>{
          setIsExpanded(false)
          setSearchText('');
          setModalView(true)
        }}
        searchPress={handleToggleSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e2d2d'
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
    paddingLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logouttitle: {
    fontSize: 13,
    fontWeight: '200',
    color: '#fff',
  },
  renderStyle: {
    flexDirection: 'row', 
    padding: 5, 
    alignItems: 'center', 
    borderBottomWidth: 0.5, 
    borderColor: 'white'
  },
  searchCloseText: {
    fontSize: 24,
    color: 'white',
  },
  searchCloseBtn: {
    backgroundColor: 'red', 
    width: 25,
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'white',
    borderRightColor: 'white', 
    borderBottomColor: 'white',
  },
  searchContainer: {
    width: '90%', 
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white', 
    borderBottomColor: 'white',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  }
});

export default HomeScreen;
