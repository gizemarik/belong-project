// Modal layout for player and other modals
import { Stack } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';

export default function ModalLayout() {
  const { theme } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text.primary,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="player"
        options={{
          title: 'Now Playing',
          headerBackTitle: 'Close',
        }}
      />
      <Stack.Screen
        name="challenge/[id]"
        options={{
          title: 'Challenge Details',
          headerBackTitle: 'Close',
        }}
      />
    </Stack>
  );
}