import { useState } from "react";
import { Text, View } from "react-native";
import { GroupCard } from "../../src/components/GroupCard";
import { Input, ScreenScroll, SecondaryButton, Splash } from "../../src/components/ui";
import { useGroups } from "../../src/hooks/queries";
import { styles } from "../../src/theme";

export default function GroupsScreen() {
  const [cityInput, setCityInput] = useState("");
  const [neighborhoodInput, setNeighborhoodInput] = useState("");
  const [filters, setFilters] = useState({ city: "", neighborhood: "" });

  const { data, isLoading, isError, error, refetch, isRefetching } = useGroups(filters.city, filters.neighborhood);

  return (
    <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
      <Text style={styles.title}>Local groups</Text>
      <Text style={styles.muted}>Browse small crews and request to join when one fits.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location filters</Text>
        <Input label="City" value={cityInput} onChangeText={setCityInput} />
        <Input label="Neighborhood" value={neighborhoodInput} onChangeText={setNeighborhoodInput} />
        <SecondaryButton
          label="Apply filters"
          onPress={() => setFilters({ city: cityInput, neighborhood: neighborhoodInput })}
        />
      </View>

      {isLoading ? (
        <Splash label="Loading groups..." />
      ) : isError ? (
        <Text style={styles.errorText}>{error instanceof Error ? error.message : "Could not load groups."}</Text>
      ) : data && data.groups.length ? (
        data.groups.map((group) => <GroupCard key={group.id} group={group} />)
      ) : (
        <Text style={styles.empty}>No groups match those filters.</Text>
      )}
    </ScreenScroll>
  );
}
