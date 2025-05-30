'use client';

import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Input } from './Input';
import { Clipboard, ClipboardType, Heading } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from './Button';
import { useCreateRequest } from '@/hooks/use-requests';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function RequestModal({ isVisible, onClose }: Props) {
  const [title, setTitle] = useState('');
  const { mutate } = useCreateRequest();
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    description: '',
  });
  const validate = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
    };

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    // Implement save logic here
    if (!validate()) return;
    mutate(
      {
        title,
        description,
      },
      {
        onSuccess(data, variables, context) {
          setTitle('');
          setDescription('');
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 24,
                padding: 16,
                height: '50%',
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: 700 }}>
                  Send Request
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <AntDesign name="close" color="black" size={24} />
                </TouchableOpacity>
              </View>
              <Input
                label="Title "
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
                error={errors.title}
                leftIcon={<ClipboardType size={20} color={colors.textLight} />}
              />
              <Input
                label="Description "
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
                error={errors.description}
                leftIcon={<Clipboard size={20} color={colors.textLight} />}
              />
              <Button onPress={handleSave}>Send</Button>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
