import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, styles } from "../theme";

export function Splash({ label = "Loading CrewGoals..." }: { label?: string }) {
  return (
    <SafeAreaView style={[styles.safe, styles.center]}>
      <ActivityIndicator color={colors.moss} />
      <Text style={styles.muted}>{label}</Text>
    </SafeAreaView>
  );
}

/** Scrollable screen body with optional pull-to-refresh. */
export function ScreenScroll({
  children,
  onRefresh,
  refreshing,
}: {
  children: React.ReactNode;
  onRefresh?: () => void | Promise<unknown>;
  refreshing?: boolean;
}) {
  return (
    <ScrollView
      style={styles.body}
      contentContainerStyle={styles.bodyContent}
      refreshControl={
        onRefresh
          ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.moss} />
          : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[styles.primaryButton, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[styles.secondaryButton, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function Input(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none";
  keyboardType?: "email-address";
  multiline?: boolean;
  required?: boolean;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const hasVisibilityToggle = Boolean(props.secureTextEntry);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {props.label}
        {props.required ? " *" : ""}
      </Text>
      <View style={hasVisibilityToggle ? styles.inputWrap : undefined}>
        <TextInput
          style={[styles.input, hasVisibilityToggle && styles.inputWithButton, props.multiline && styles.textarea]}
          value={props.value}
          onChangeText={props.onChangeText}
          secureTextEntry={props.secureTextEntry && !showSecret}
          autoCapitalize={props.autoCapitalize}
          keyboardType={props.keyboardType}
          multiline={props.multiline}
        />
        {hasVisibilityToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showSecret ? "Hide password" : "Show password"}
            style={styles.visibilityButton}
            onPress={() => setShowSecret((current) => !current)}
          >
            <Text style={styles.visibilityText}>{showSecret ? "Hide" : "Show"}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ScoreInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.scoreRow}>
        {["1", "2", "3", "4", "5"].map((score) => (
          <Pressable
            key={score}
            style={[styles.scoreButton, value === score && styles.scoreButtonActive]}
            onPress={() => onChangeText(score)}
          >
            <Text style={[styles.scoreText, value === score && styles.scoreTextActive]}>{score}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function ToggleChoice({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        <Pressable style={[styles.segmentButton, value && styles.segmentActive]} onPress={() => onChange(true)}>
          <Text style={styles.segmentText}>Yes</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, !value && styles.segmentActive]} onPress={() => onChange(false)}>
          <Text style={styles.segmentText}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Chips<T extends string | number>({
  options,
  isActive,
  onToggle,
}: {
  options: T[];
  isActive: (option: T) => boolean;
  onToggle: (option: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = isActive(option);
        return (
          <Pressable
            key={String(option)}
            style={[styles.choice, active && styles.choiceActive]}
            onPress={() => onToggle(option)}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{String(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChoiceGroup({
  label,
  options,
  selected,
  onChange,
  required,
  helper,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  helper?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
      <Chips
        options={options}
        isActive={(option) => selected.includes(option)}
        onToggle={(option) =>
          onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
        }
      />
    </View>
  );
}

export function SingleChoice({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      <Chips options={options} isActive={(option) => value === option} onToggle={onChange} />
    </View>
  );
}

export function NumberChoice({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      <Chips options={options} isActive={(option) => value === option} onToggle={onChange} />
    </View>
  );
}
