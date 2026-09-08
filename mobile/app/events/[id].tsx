import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import {
  DetailItem,
  Input,
  PrimaryButton,
  ScoreInput,
  ScreenScroll,
  SecondaryButton,
  Splash,
  ToggleChoice,
} from "../../src/components/ui";
import { useBlockUser, usePostComment, useReport, useSubmitFeedback } from "../../src/hooks/mutations";
import { useEvent } from "../../src/hooks/queries";
import { styles } from "../../src/theme";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id ?? "";
  const { data, isLoading, isError, error, refetch, isRefetching } = useEvent(eventId);

  const feedback = useSubmitFeedback(eventId);
  const postComment = usePostComment(eventId);
  const report = useReport();
  const block = useBlockUser();

  const [rating, setRating] = useState("5");
  const [comfortScore, setComfortScore] = useState("5");
  const [groupMatchScore, setGroupMatchScore] = useState("5");
  const [wouldAttendAgain, setWouldAttendAgain] = useState(true);
  const [wouldInviteFriend, setWouldInviteFriend] = useState(true);
  const [comment, setComment] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  if (isLoading) return <Splash />;
  if (isError || !data) {
    return (
      <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
        <Text style={styles.errorText}>{error instanceof Error ? error.message : "Could not load this event."}</Text>
      </ScreenScroll>
    );
  }

  const { event, membership, attendance, canSubmitFeedback } = data;
  const busy = feedback.isPending || postComment.isPending || report.isPending || block.isPending;

  function submitFeedback() {
    feedback.mutate(
      {
        rating: Number(rating),
        comfortScore: Number(comfortScore),
        groupMatchScore: Number(groupMatchScore),
        wouldAttendAgain,
        wouldInviteFriend,
        comment,
      },
      {
        onSuccess: () => Alert.alert("Feedback submitted", "Thanks for helping improve group fit."),
        onError: (e) => Alert.alert("Unable to submit feedback", e instanceof Error ? e.message : "Try again."),
      }
    );
  }

  function addComment() {
    if (!newComment.trim()) return;
    postComment.mutate(newComment.trim(), {
      onSuccess: () => setNewComment(""),
      onError: (e) => Alert.alert("Unable to comment", e instanceof Error ? e.message : "Try again."),
    });
  }

  function submitReport() {
    if (!reportReason.trim()) {
      Alert.alert("Reason required", "Add a short reason before submitting a report.");
      return;
    }
    report.mutate(
      { eventId, groupId: event.groupId, reason: reportReason.trim(), details: reportDetails.trim() || undefined },
      {
        onSuccess: () => {
          setReportReason("");
          setReportDetails("");
          Alert.alert("Report sent", "An admin can review this from the reports panel.");
        },
        onError: (e) => Alert.alert("Unable to report", e instanceof Error ? e.message : "Try again."),
      }
    );
  }

  function blockUser(userId: string) {
    block.mutate(userId, {
      onSuccess: () => Alert.alert("User blocked", "This block is saved for admin/safety review."),
      onError: (e) => Alert.alert("Unable to block", e instanceof Error ? e.message : "Try again."),
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <ScreenScroll onRefresh={refetch} refreshing={isRefetching}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.muted}>{event.group.title}</Text>

        <View style={styles.card}>
          <View style={styles.chips}>
            <Text style={styles.chip}>{event.status.toLowerCase()}</Text>
            {membership ? <Text style={styles.chip}>Your status: {membership.status.toLowerCase()}</Text> : null}
            {attendance ? <Text style={styles.chip}>Attendance: {attendance.status.toLowerCase()}</Text> : null}
          </View>
          <Text style={styles.description}>{event.description}</Text>
          <View style={styles.detailGrid}>
            <DetailItem label="Location" value={event.locationName} />
            <DetailItem label="Address" value={event.address} />
            <DetailItem label="Starts" value={new Date(event.startTime).toLocaleString()} />
            <DetailItem label="Ends" value={new Date(event.endTime).toLocaleString()} />
            <DetailItem label="Host" value={event.hostName} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Event comments</Text>
          {event.comments.length ? (
            event.comments.map((item) => (
              <View key={item.id} style={styles.commentBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.statusTitle}>{item.user.name}</Text>
                  <Pressable onPress={() => blockUser(item.user.id)} disabled={busy}>
                    <Text style={styles.linkText}>Block</Text>
                  </Pressable>
                </View>
                <Text style={styles.description}>{item.body}</Text>
                <Text style={styles.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No comments yet.</Text>
          )}
          <Input label="Add comment" value={newComment} onChangeText={setNewComment} multiline />
          <SecondaryButton label="Post comment" onPress={addComment} disabled={busy || !newComment.trim()} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Safety</Text>
          <Input label="Report reason" value={reportReason} onChangeText={setReportReason} />
          <Input label="Details" value={reportDetails} onChangeText={setReportDetails} multiline />
          <SecondaryButton label="Submit report" onPress={submitReport} disabled={busy || !reportReason.trim()} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          {canSubmitFeedback ? (
            <>
              <Text style={styles.description}>Tell us how the event felt so future matches get better.</Text>
              <ScoreInput label="Overall rating" value={rating} onChangeText={setRating} />
              <ScoreInput label="Comfort score" value={comfortScore} onChangeText={setComfortScore} />
              <ScoreInput label="Group match score" value={groupMatchScore} onChangeText={setGroupMatchScore} />
              <ToggleChoice label="Would attend again" value={wouldAttendAgain} onChange={setWouldAttendAgain} />
              <ToggleChoice label="Would invite a friend" value={wouldInviteFriend} onChange={setWouldInviteFriend} />
              <Input label="Comment" value={comment} onChangeText={setComment} multiline />
              <PrimaryButton label={feedback.isPending ? "Submitting..." : "Submit feedback"} onPress={submitFeedback} disabled={busy} />
            </>
          ) : (
            <Text style={styles.description}>
              Feedback unlocks after an admin marks you as attended and marks this event as completed.
            </Text>
          )}
        </View>
      </ScreenScroll>
    </>
  );
}
