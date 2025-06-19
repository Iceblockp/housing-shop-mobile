import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';

interface SearchInputProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');
  
  const handleClear = () => {
    setQuery('');
    onSearch('');
  };
  
  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search for groceries..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={handleChangeText}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.filterButton} onPress={onFilter}>
        <Filter size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    backgroundColor: '#1E40AF',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default SearchInput;