import { Image, StyleSheet } from 'react-native';

import noClassroom from '@/assets/images/no-classroom.png';
import { Box, sizes, Text } from '@/core/theme';

const { width, height, imageHeight } = sizes.noClassroom;

export function NoClassesState() {
  return (
    <Box alignItems="center" marginTop="ml">
      <Box
        width={width}
        height={height}
        overflow="hidden"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <Image source={noClassroom} style={styles.image} />
      </Box>
      <Text variant="emptyState" textAlign="center" marginTop="ml">
        Sem aulas neste dia
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height: imageHeight,
  },
});
