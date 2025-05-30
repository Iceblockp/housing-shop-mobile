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
import { Heading, MessageCircleIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from './Button';
import { useCreateRequest, useUpdateRequest } from '@/hooks/use-requests';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  id: string;
};

export default function AdminReplyModel({ isVisible, onClose, id }: Props) {
  const { mutate } = useUpdateRequest(id);
  const [adminReply, setAdminReply] = useState('');
  const [errors, setErrors] = useState({
    adminReply: '',
  });
  const validate = () => {
    let isValid = true;
    const newErrors = {
      adminReply: '',
    };

    if (!adminReply.trim()) {
      newErrors.adminReply = 'Reply is required';
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
        adminReply,
      },
      {
        onSuccess(data, variables, context) {
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
                  Request Reply Form
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <AntDesign name="close" color="black" size={24} />
                </TouchableOpacity>
              </View>
              <Input
                label="Reply "
                placeholder="Enter reply"
                value={adminReply}
                onChangeText={setAdminReply}
                error={errors.adminReply}
                leftIcon={
                  <MessageCircleIcon size={20} color={colors.textLight} />
                }
              />

              <Button onPress={handleSave}>Send</Button>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
