import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../theme';

const Avatar = ({ uri, name, size = 48, style }) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const fontSize = size * 0.38;

  if (uri && !imgError) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, containerStyle, style]}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={[styles.fallback, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '700',
  },
});

export default Avatar;
