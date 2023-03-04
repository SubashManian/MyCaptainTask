import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Button } from 'react-native';

const GroupDialogBox = ({ visible, onClose, onSave }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSave({ groupName, description });
    setGroupName('');
    setDescription('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <View style={{ backgroundColor: '#454544', padding: 10, borderRadius: 10, width: '85%'}}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Create a Group</Text>
          <TextInput
            placeholder="Enter Group Name"
            value={groupName}
            autoFocus={true}
            onChangeText={setGroupName}
            style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10, color: 'white' }}
          />
          <TextInput
            placeholder="Enter Group Description"
            value={description}
            returnKeyType={'done'}
            onSubmitEditing={() => {onSave({ groupName, description })}}
            onChangeText={setDescription}
            style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 10, color: 'white' }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Button title="Cancel" onPress={onClose}/>
            <Button title="Save" onPress={handleSave}/>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GroupDialogBox;
