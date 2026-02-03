import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Appbar, Card, Button, Text, TextInput, Chip, FAB, Divider, IconButton, Dialog, Portal } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { format, addDays, addMonths, addYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { parseMeetingNotesFromMarkdown, isMeetingNotesDocument, MeetingNotesData } from '@/utils/meetingNotesParser';

interface Attendee {
  id: string;
  name: string;
}

interface AgendaItem {
  id: string;
  topic: string;
}

interface DiscussionPoint {
  id: string;
  topic: string;
  points: string[];
}

interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
}

interface NextStep {
  id: string;
  step: string;
}

export default function MeetingNotesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { documents, createDocument, updateDocument } = useDocumentStore();
  const isEditMode = !!id;
  
  const existingDoc = isEditMode ? documents.find(d => d.id === id) : null;
  
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [newAttendee, setNewAttendee] = useState('');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [discussionPoints, setDiscussionPoints] = useState<DiscussionPoint[]>([]);
  const [newDiscussionTopic, setNewDiscussionTopic] = useState('');
  const [newDiscussionPoint, setNewDiscussionPoint] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState<Date | null>(null);
  const [showActionDatePicker, setShowActionDatePicker] = useState(false);
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [newNextStep, setNewNextStep] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (isEditMode && existingDoc) {
      try {
        const parsed = parseMeetingNotesFromMarkdown(existingDoc.content);
        setMeetingTitle(parsed.meetingTitle || existingDoc.title);
        // Try to parse the date, fallback to current date
        try {
          const parsedDate = parsed.meetingDate ? new Date(parsed.meetingDate) : new Date();
          setMeetingDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
        } catch {
          setMeetingDate(new Date());
        }
        setAttendees(parsed.attendees);
        setAgendaItems(parsed.agendaItems);
        setDiscussionPoints(parsed.discussionPoints);
        setActionItems(parsed.actionItems);
        setNextSteps(parsed.nextSteps);
        setNotes(parsed.notes);
      } catch (error) {
        console.error('Error parsing meeting notes:', error);
        // If parsing fails, try to extract at least title
        setMeetingTitle(existingDoc.title);
      }
    }
  }, [isEditMode, existingDoc]);

  const addAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, { id: Date.now().toString() + Math.random(), name: newAttendee.trim() }]);
      setNewAttendee('');
    }
  };

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const addAgendaItem = () => {
    if (newAgendaItem.trim()) {
      setAgendaItems([...agendaItems, { id: Date.now().toString() + Math.random(), topic: newAgendaItem.trim() }]);
      setNewAgendaItem('');
    }
  };

  const removeAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(a => a.id !== id));
  };

  const addDiscussionPoint = () => {
    // Allow adding with just topic or just point - both optional
    const topic = newDiscussionTopic.trim();
    const point = newDiscussionPoint.trim();
    
    if (topic || point) {
      if (topic && point) {
        // Both provided - add point to existing topic or create new
        const existing = discussionPoints.find(d => d.topic === topic);
        if (existing) {
          setDiscussionPoints(
            discussionPoints.map(d =>
              d.id === existing.id
                ? { ...d, points: [...d.points, point] }
                : d
            )
          );
        } else {
          setDiscussionPoints([
            ...discussionPoints,
            {
              id: Date.now().toString() + Math.random(),
              topic: topic,
              points: [point],
            },
          ]);
        }
        setNewDiscussionPoint('');
      } else if (topic) {
        // Only topic provided - create topic with empty points array
        setDiscussionPoints([
          ...discussionPoints,
          {
            id: Date.now().toString() + Math.random(),
            topic: topic,
            points: [],
          },
        ]);
        setNewDiscussionTopic('');
      } else if (point) {
        // Only point provided - add to last topic or create "General" topic
        if (discussionPoints.length > 0) {
          const lastTopic = discussionPoints[discussionPoints.length - 1];
          setDiscussionPoints(
            discussionPoints.map((d, idx) =>
              idx === discussionPoints.length - 1
                ? { ...d, points: [...d.points, point] }
                : d
            )
          );
        } else {
          setDiscussionPoints([
            {
              id: Date.now().toString() + Math.random(),
              topic: 'General',
              points: [point],
            },
          ]);
        }
        setNewDiscussionPoint('');
      }
    }
  };

  const removeDiscussionPoint = (topicId: string, pointIndex: number) => {
    setDiscussionPoints(
      discussionPoints.map(d =>
        d.id === topicId
          ? { ...d, points: d.points.filter((_, i) => i !== pointIndex) }
          : d
      ).filter(d => d.points.length > 0)
    );
  };

  const removeDiscussionTopic = (topicId: string) => {
    setDiscussionPoints(discussionPoints.filter(d => d.id !== topicId));
  };

  const addActionItem = () => {
    // Task is optional - allow adding action item even without task
    const dueDateStr = newActionDueDate 
      ? format(newActionDueDate, 'MMM d, yyyy')
      : 'TBD';
    
    setActionItems([
      ...actionItems,
      {
        id: Date.now().toString() + Math.random(),
        task: newActionTask.trim() || 'Untitled Task',
        assignedTo: newActionAssignee.trim() || 'Unassigned',
        dueDate: dueDateStr,
      },
    ]);
    setNewActionTask('');
    setNewActionAssignee('');
    setNewActionDueDate(null);
  };

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter(a => a.id !== id));
  };

  const addNextStep = () => {
    if (newNextStep.trim()) {
      setNextSteps([...nextSteps, { id: Date.now().toString() + Math.random(), step: newNextStep.trim() }]);
      setNewNextStep('');
    }
  };

  const removeNextStep = (id: string) => {
    setNextSteps(nextSteps.filter(n => n.id !== id));
  };

  const generateMarkdown = (): string => {
    let md = `# ${meetingTitle || 'Meeting Notes'}\n\n`;
    md += `## Date: ${format(meetingDate, 'MMMM d, yyyy')}\n\n`;

    if (attendees.length > 0) {
      md += `### Attendees\n`;
      attendees.forEach(attendee => {
        md += `- ${attendee.name}\n`;
      });
      md += `\n`;
    }

    if (agendaItems.length > 0) {
      md += `### Agenda\n`;
      agendaItems.forEach((item, index) => {
        md += `${index + 1}. ${item.topic}\n`;
      });
      md += `\n`;
    }

    if (discussionPoints.length > 0) {
      md += `### Discussion Points\n\n`;
      discussionPoints.forEach(discussion => {
        md += `#### ${discussion.topic}\n`;
        discussion.points.forEach(point => {
          md += `- ${point}\n`;
        });
        md += `\n`;
      });
    }

    if (actionItems.length > 0) {
      md += `### Action Items\n`;
      actionItems.forEach(item => {
        md += `- [ ] ${item.task} - Assigned to: ${item.assignedTo} - Due: ${item.dueDate}\n`;
      });
      md += `\n`;
    }

    if (nextSteps.length > 0) {
      md += `### Next Steps\n`;
      nextSteps.forEach(step => {
        md += `- ${step.step}\n`;
      });
      md += `\n`;
    }

    if (notes.trim()) {
      md += `### Notes\n\n${notes}\n`;
    }

    return md;
  };

  const handleSave = async () => {
    if (!meetingTitle.trim()) {
      Alert.alert('Required', 'Please enter a meeting title');
      return;
    }

    setLoading(true);
    try {
      const content = generateMarkdown();
      
      if (isEditMode && id) {
        await updateDocument(id, {
          title: meetingTitle,
          content,
        });
        setLoading(false); // Stop loading before showing alert
        Alert.alert('Success', 'Meeting notes updated!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        const doc = await createDocument({
          title: meetingTitle,
          content,
        });
        setLoading(false); // Stop loading before showing alert
        Alert.alert('Success', 'Meeting notes saved!', [
          {
            text: 'OK',
            onPress: () => router.push(`/editor/${doc.id}`),
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving meeting notes:', error);
      setLoading(false); // Stop loading on error
      Alert.alert('Error', 'Failed to save meeting notes. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content 
          title={isEditMode ? "Edit Meeting Notes" : "Meeting Notes"} 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="content-save" 
          onPress={handleSave}
          disabled={loading}
        />
      </Appbar.Header>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card style={[styles.card, styles.headerCard]}>
          <Card.Content>
            <View style={styles.headerIconContainer}>
              <IconButton
                icon="calendar-text"
                size={32}
                iconColor="#6200ee"
                style={styles.headerIcon}
              />
            </View>
            <TextInput
              label="Meeting Title *"
              value={meetingTitle}
              onChangeText={setMeetingTitle}
              mode="outlined"
              style={styles.titleInput}
              placeholder="e.g., Weekly Team Sync"
              left={<TextInput.Icon icon="format-title" />}
            />
            <View>
              <TextInput
                label="Date"
                value={format(meetingDate, 'MMMM d, yyyy')}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
                right={<TextInput.Icon icon="calendar-edit" onPress={() => setShowDatePicker(true)} />}
                onFocus={() => setShowDatePicker(true)}
                showSoftInputOnFocus={false}
                editable={false}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Attendees */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="account-group" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Attendees
              </Text>
            </View>
            {attendees.length > 0 && (
              <View style={styles.chipContainer}>
                {attendees.map(attendee => (
                  <Chip
                    key={attendee.id}
                    onClose={() => removeAttendee(attendee.id)}
                    style={styles.chip}
                    mode="flat"
                    selectedColor="#6200ee"
                  >
                    {attendee.name}
                  </Chip>
                ))}
              </View>
            )}
            <View style={styles.addRow}>
              <TextInput
                label="Add Attendee"
                value={newAttendee}
                onChangeText={setNewAttendee}
                mode="outlined"
                style={styles.flexInput}
                onSubmitEditing={addAttendee}
                right={<TextInput.Icon icon="account-plus" />}
              />
              <Button 
                mode="contained" 
                onPress={addAttendee} 
                style={styles.addButton}
                icon="plus"
                disabled={!newAttendee.trim()}
              >
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Agenda */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="format-list-numbered" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Agenda
              </Text>
            </View>
            {agendaItems.length > 0 && (
              <View style={styles.listContainer}>
                {agendaItems.map((item, index) => (
                  <View key={item.id} style={styles.listItemCard}>
                    <View style={styles.listItem}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.listText}>{item.topic}</Text>
                      <IconButton
                        icon="close-circle"
                        size={20}
                        iconColor="#d32f2f"
                        onPress={() => removeAgendaItem(item.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.addRow}>
              <TextInput
                label="Add Agenda Item"
                value={newAgendaItem}
                onChangeText={setNewAgendaItem}
                mode="outlined"
                style={styles.flexInput}
                onSubmitEditing={addAgendaItem}
                right={<TextInput.Icon icon="plus-circle" />}
              />
              <Button 
                mode="contained" 
                onPress={addAgendaItem} 
                style={styles.addButton}
                icon="plus"
                disabled={!newAgendaItem.trim()}
              >
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Discussion Points */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="comment-text-multiple" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Discussion Points
              </Text>
            </View>
            {discussionPoints.length > 0 && (
              <View style={styles.discussionContainer}>
                {discussionPoints.map(discussion => (
                  <View key={discussion.id} style={styles.discussionCard}>
                    <View style={styles.discussionHeader}>
                      <Text variant="titleMedium" style={styles.discussionTopic}>
                        {discussion.topic}
                      </Text>
                      <IconButton
                        icon="close-circle"
                        size={20}
                        iconColor="#d32f2f"
                        onPress={() => removeDiscussionTopic(discussion.id)}
                      />
                    </View>
                    <Divider style={styles.divider} />
                    {discussion.points.map((point, index) => (
                      <View key={index} style={styles.listItem}>
                        <View style={styles.bulletPoint} />
                        <Text style={styles.listText}>{point}</Text>
                        <IconButton
                          icon="close"
                          size={18}
                          iconColor="#757575"
                          onPress={() => removeDiscussionPoint(discussion.id, index)}
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
            <View style={styles.addRow}>
              <TextInput
                label="Topic"
                value={newDiscussionTopic}
                onChangeText={setNewDiscussionTopic}
                mode="outlined"
                style={styles.flexInput}
                right={<TextInput.Icon icon="tag" />}
              />
            </View>
            <View style={styles.addRow}>
              <TextInput
                label="Discussion Point"
                value={newDiscussionPoint}
                onChangeText={setNewDiscussionPoint}
                mode="outlined"
                style={styles.flexInput}
                onSubmitEditing={addDiscussionPoint}
                right={<TextInput.Icon icon="comment-plus" />}
              />
              <Button 
                mode="contained" 
                onPress={addDiscussionPoint} 
                style={styles.addButton}
                icon="plus"
                disabled={!newDiscussionTopic.trim() && !newDiscussionPoint.trim()}
              >
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Action Items */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="checkbox-marked-circle" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Action Items
              </Text>
            </View>
            {actionItems.length > 0 && (
              <View style={styles.listContainer}>
                {actionItems.map(item => (
                  <View key={item.id} style={styles.actionItemCard}>
                    <View style={styles.actionItem}>
                      <IconButton icon="checkbox-blank-circle-outline" size={20} iconColor="#6200ee" />
                      <View style={styles.actionItemContent}>
                        <Text style={styles.actionTask}>{item.task}</Text>
                        <View style={styles.actionMeta}>
                          <Chip mode="flat" compact style={styles.metaChip}>
                            👤 {item.assignedTo}
                          </Chip>
                          <Chip mode="flat" compact style={styles.metaChip}>
                            📅 {item.dueDate}
                          </Chip>
                        </View>
                      </View>
                      <IconButton
                        icon="close-circle"
                        size={20}
                        iconColor="#d32f2f"
                        onPress={() => removeActionItem(item.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
            <TextInput
              label="Task"
              value={newActionTask}
              onChangeText={setNewActionTask}
              mode="outlined"
              style={styles.input}
              placeholder="Optional task description"
              right={<TextInput.Icon icon="format-list-checks" />}
            />
            <View style={styles.addRow}>
              <TextInput
                label="Assigned To"
                value={newActionAssignee}
                onChangeText={setNewActionAssignee}
                mode="outlined"
                style={styles.flexInput}
                right={<TextInput.Icon icon="account" />}
              />
              <View style={styles.flexInput}>
                <TextInput
                  label="Due Date"
                  value={newActionDueDate ? format(newActionDueDate, 'MMM d, yyyy') : ''}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="calendar-clock" />}
                  right={<TextInput.Icon icon="calendar-edit" onPress={() => setShowActionDatePicker(true)} />}
                  onFocus={() => setShowActionDatePicker(true)}
                  showSoftInputOnFocus={false}
                  editable={false}
                  placeholder="Select due date"
                />
              </View>
            </View>
            <Button 
              mode="contained" 
              onPress={addActionItem} 
              style={styles.button}
              icon="plus"
            >
              Add Action Item
            </Button>
          </Card.Content>
        </Card>

        {/* Next Steps */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="arrow-right-circle" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Next Steps
              </Text>
            </View>
            {nextSteps.length > 0 && (
              <View style={styles.listContainer}>
                {nextSteps.map(step => (
                  <View key={step.id} style={styles.listItemCard}>
                    <View style={styles.listItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.listText}>{step.step}</Text>
                      <IconButton
                        icon="close-circle"
                        size={20}
                        iconColor="#d32f2f"
                        onPress={() => removeNextStep(step.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.addRow}>
              <TextInput
                label="Add Next Step"
                value={newNextStep}
                onChangeText={setNewNextStep}
                mode="outlined"
                style={styles.flexInput}
                onSubmitEditing={addNextStep}
                right={<TextInput.Icon icon="arrow-right" />}
              />
              <Button 
                mode="contained" 
                onPress={addNextStep} 
                style={styles.addButton}
                icon="plus"
                disabled={!newNextStep.trim()}
              >
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Additional Notes */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <IconButton icon="note-text" size={24} iconColor="#6200ee" />
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Additional Notes
              </Text>
            </View>
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder="Any additional notes or observations..."
              right={<TextInput.Icon icon="pencil" />}
            />
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            icon="content-save"
            loading={loading}
            disabled={loading || !meetingTitle.trim()}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
          >
            {isEditMode ? 'Update Meeting Notes' : 'Save Meeting Notes'}
          </Button>
        </View>
      </ScrollView>

      {/* Meeting Date Picker Dialog */}
      <Portal>
        <Dialog visible={showDatePicker} onDismiss={() => setShowDatePicker(false)} style={styles.datePickerDialog}>
          <Dialog.Title>Select Meeting Date</Dialog.Title>
          <Dialog.Content>
            <DatePickerComponent
              selectedDate={meetingDate}
              onDateSelect={(date) => {
                setMeetingDate(date);
                setShowDatePicker(false);
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDatePicker(false)}>Cancel</Button>
            <Button onPress={() => {
              setMeetingDate(new Date());
              setShowDatePicker(false);
            }}>Today</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Action Item Due Date Picker Dialog */}
      <Portal>
        <Dialog visible={showActionDatePicker} onDismiss={() => setShowActionDatePicker(false)} style={styles.datePickerDialog}>
          <Dialog.Title>Select Due Date</Dialog.Title>
          <Dialog.Content>
            <DatePickerComponent
              selectedDate={newActionDueDate || new Date()}
              onDateSelect={(date) => {
                setNewActionDueDate(date);
                setShowActionDatePicker(false);
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setNewActionDueDate(null);
              setShowActionDatePicker(false);
            }}>Clear</Button>
            <Button onPress={() => setShowActionDatePicker(false)}>Cancel</Button>
            <Button onPress={() => {
              setNewActionDueDate(new Date());
              setShowActionDatePicker(false);
            }}>Today</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Action Item Due Date Picker Dialog */}
      <Portal>
        <Dialog visible={showActionDatePicker} onDismiss={() => setShowActionDatePicker(false)} style={styles.datePickerDialog}>
          <Dialog.Title>Select Due Date</Dialog.Title>
          <Dialog.Content>
            <DatePickerComponent
              selectedDate={newActionDueDate || new Date()}
              onDateSelect={(date) => {
                setNewActionDueDate(date);
                setShowActionDatePicker(false);
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setNewActionDueDate(null);
              setShowActionDatePicker(false);
            }}>Clear</Button>
            <Button onPress={() => setShowActionDatePicker(false)}>Cancel</Button>
            <Button onPress={() => {
              setNewActionDueDate(new Date());
              setShowActionDatePicker(false);
            }}>Today</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// Custom Date Picker Component
function DatePickerComponent({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect: (date: Date) => void }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handlePrevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  return (
    <View style={styles.datePickerContainer}>
      <View style={styles.datePickerHeader}>
        <IconButton icon="chevron-left" onPress={handlePrevMonth} />
        <Text variant="titleLarge" style={styles.monthYearText}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <IconButton icon="chevron-right" onPress={handleNextMonth} />
      </View>
      
      <View style={styles.weekDaysRow}>
        {weekDays.map(day => (
          <View key={day} style={styles.weekDayCell}>
            <Text variant="bodySmall" style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Button
              key={index}
              mode={isSelected ? 'contained' : 'text'}
              onPress={() => onDateSelect(day)}
              style={[
                styles.calendarDay,
                !isCurrentMonth && styles.calendarDayOtherMonth,
                isToday && !isSelected && styles.calendarDayToday,
              ]}
              labelStyle={[
                !isCurrentMonth && styles.calendarDayTextOtherMonth,
                isToday && !isSelected && styles.calendarDayTextToday,
              ]}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    elevation: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  headerCard: {
    backgroundColor: '#f3e5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  headerIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  titleInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  flexInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#ffffff',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  addButton: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  listContainer: {
    marginBottom: 12,
  },
  listItemCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
    padding: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    lineHeight: 22,
  },
  discussionContainer: {
    marginBottom: 12,
  },
  discussionCard: {
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discussionTopic: {
    fontWeight: 'bold',
    color: '#6200ee',
    flex: 1,
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#e0e0e0',
  },
  actionItemCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginBottom: 8,
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionItemContent: {
    flex: 1,
    marginLeft: 4,
  },
  actionTask: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 4,
  },
  actionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaChip: {
    marginRight: 4,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
  },
  saveButtonContainer: {
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  saveButton: {
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 4,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerDialog: {
    maxWidth: 400,
    alignSelf: 'center',
  },
  datePickerContainer: {
    padding: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthYearText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontWeight: '600',
    color: '#757575',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    minWidth: 40,
    margin: 2,
    padding: 0,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  calendarDayTextOtherMonth: {
    color: '#bdbdbd',
  },
  calendarDayTextToday: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});
