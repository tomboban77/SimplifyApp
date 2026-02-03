import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, Chip } from 'react-native-paper';
import { useState } from 'react';

interface MarkdownViewerProps {
  content: string;
  isMeetingNotes?: boolean;
}

export function MarkdownViewer({ content, isMeetingNotes = false }: MarkdownViewerProps) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let currentNumberedList: string[] = [];
  let listIndex = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <View key={`ul-${listIndex++}`} style={styles.listContainer}>
          {currentList.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
      currentList = [];
    }
    if (currentNumberedList.length > 0) {
      elements.push(
        <View key={`ol-${listIndex++}`} style={styles.listContainer}>
          {currentNumberedList.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );
      currentNumberedList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList();
      const text = trimmed.substring(2);
      elements.push(
        <Text key={index} style={styles.h1}>
          {text}
        </Text>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      const text = trimmed.substring(3);
      if (isMeetingNotes && (text.startsWith('Date:') || text.includes('Date:'))) {
        const dateMatch = text.match(/Date:\s*(.+)/);
        if (dateMatch) {
          elements.push(
            <View key={index} style={styles.dateContainer}>
              <Chip icon="calendar" style={styles.dateChip} textStyle={styles.dateChipText}>
                {dateMatch[1]}
              </Chip>
            </View>
          );
        }
      } else {
        elements.push(
          <Text key={index} style={styles.h2}>
            {text}
          </Text>
        );
      }
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      const text = trimmed.substring(4);
      elements.push(
        <View key={index} style={styles.h3Container}>
          <View style={styles.h3Accent} />
          <Text style={styles.h3}>{text}</Text>
        </View>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      flushList();
      const text = trimmed.substring(5);
      elements.push(
        <Text key={index} style={styles.h4}>
          {text}
        </Text>
      );
      return;
    }

    // Action items (checkboxes)
    const checkboxMatch = trimmed.match(/^- \[([ x])\] (.+)$/);
    if (checkboxMatch) {
      flushList();
      const isChecked = checkboxMatch[1] === 'x';
      const taskText = checkboxMatch[2];
      
      // Parse action item details - format: "Task - Assigned to: Name - Due: Date"
      const parts = taskText.split(/\s*-\s*(?:Assigned to:|Due:)\s*/);
      const task = parts[0]?.trim() || taskText;
      const assignee = parts[1]?.trim();
      const dueDate = parts[2]?.trim();

      elements.push(
        <Card key={index} style={styles.actionItemCard} elevation={1}>
          <Card.Content style={styles.actionItemContent}>
            <View style={styles.actionItemRow}>
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.actionItemText}>
                <Text style={[styles.actionTask, isChecked && styles.actionTaskCompleted]}>
                  {task}
                </Text>
                {(assignee || dueDate) && (
                  <View style={styles.actionMeta}>
                    {assignee && (
                      <Chip mode="flat" compact style={styles.metaChip} icon="account">
                        {assignee}
                      </Chip>
                    )}
                    {dueDate && (
                      <Chip mode="flat" compact style={styles.metaChip} icon="calendar">
                        {dueDate}
                      </Chip>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      );
      return;
    }

    // Bullet lists
    if (trimmed.startsWith('- ')) {
      const text = trimmed.substring(2);
      currentList.push(text);
      return;
    }

    // Numbered lists
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      currentNumberedList.push(numberedMatch[1]);
      return;
    }

    // Regular text
    if (trimmed) {
      flushList();
      // Handle bold and italic
      let processedText = trimmed;
      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;

      // Process bold (**text**)
      const boldRegex = /\*\*(.+?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(processedText)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processedText.substring(lastIndex, match.index));
        }
        parts.push(
          <Text key={`bold-${match.index}`} style={styles.bold}>
            {match[1]}
          </Text>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < processedText.length) {
        parts.push(processedText.substring(lastIndex));
      }

      if (parts.length > 0) {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {parts}
          </Text>
        );
      } else {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {trimmed}
          </Text>
        );
      }
    } else {
      // Empty line - flush lists and add spacing
      flushList();
      if (elements.length > 0 && index < lines.length - 1) {
        elements.push(<View key={`spacer-${index}`} style={styles.spacer} />);
      }
    }
  });

  flushList();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {isMeetingNotes ? (
        <Card style={styles.meetingNotesCard} elevation={0}>
          <Card.Content style={styles.meetingNotesContent}>
            {elements}
          </Card.Content>
        </Card>
      ) : (
        <View style={styles.documentContent}>
          {elements}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 0,
    paddingBottom: 40,
  },
  meetingNotesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    elevation: 0,
    margin: 0,
  },
  meetingNotesContent: {
    padding: 20,
    paddingTop: 16,
  },
  documentContent: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    paddingTop: 16,
    elevation: 0,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 4,
    lineHeight: 36,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 28,
  },
  h3Container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  h3Accent: {
    width: 3,
    height: 18,
    backgroundColor: '#6200ee',
    borderRadius: 2,
    marginRight: 10,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
    flex: 1,
    lineHeight: 22,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
    marginBottom: 12,
  },
  bold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContainer: {
    marginVertical: 8,
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6200ee',
    marginTop: 9,
    marginRight: 12,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
  },
  actionItemCard: {
    marginVertical: 6,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
    marginRight: 0,
  },
  actionItemContent: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6200ee',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionItemText: {
    flex: 1,
  },
  actionTask: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 22,
  },
  actionTaskCompleted: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  actionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    marginRight: 4,
    backgroundColor: '#ffffff',
    height: 28,
  },
  dateContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  dateChip: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
    height: 36,
  },
  dateChipText: {
    color: '#1976d2',
    fontWeight: '500',
    fontSize: 14,
  },
  spacer: {
    height: 12,
  },
});

