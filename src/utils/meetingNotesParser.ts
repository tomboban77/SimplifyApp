import { format } from 'date-fns';

export interface MeetingNotesData {
  meetingTitle: string;
  meetingDate: string;
  attendees: { id: string; name: string }[];
  agendaItems: { id: string; topic: string }[];
  discussionPoints: { id: string; topic: string; points: string[] }[];
  actionItems: { id: string; task: string; assignedTo: string; dueDate: string }[];
  nextSteps: { id: string; step: string }[];
  notes: string;
}

/**
 * Parse markdown content back into meeting notes structure
 */
export function parseMeetingNotesFromMarkdown(content: string): MeetingNotesData {
  const data: MeetingNotesData = {
    meetingTitle: '',
    meetingDate: format(new Date(), 'MMMM d, yyyy'),
    attendees: [],
    agendaItems: [],
    discussionPoints: [],
    actionItems: [],
    nextSteps: [],
    notes: '',
  };

  const lines = content.split('\n');
  let currentSection = '';
  let currentDiscussionTopic = '';
  let currentDiscussionId = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract title
    if (line.startsWith('# ')) {
      data.meetingTitle = line.substring(2).trim();
      continue;
    }

    // Extract date
    if (line.startsWith('## Date: ')) {
      data.meetingDate = line.substring(9).trim();
      continue;
    }

    // Section headers
    if (line.startsWith('### ')) {
      currentSection = line.substring(4).trim().toLowerCase();
      continue;
    }

    // Sub-section headers (discussion topics)
    if (line.startsWith('#### ')) {
      currentDiscussionTopic = line.substring(5).trim();
      currentDiscussionId = Date.now().toString() + Math.random();
      data.discussionPoints.push({
        id: currentDiscussionId,
        topic: currentDiscussionTopic,
        points: [],
      });
      continue;
    }

    // Process content based on current section
    if (line.startsWith('- ')) {
      const content = line.substring(2).trim();

      if (currentSection === 'attendees') {
        data.attendees.push({
          id: Date.now().toString() + Math.random(),
          name: content,
        });
      } else if (currentSection === 'agenda') {
        // Remove numbering if present
        const topic = content.replace(/^\d+\.\s*/, '');
        data.agendaItems.push({
          id: Date.now().toString() + Math.random(),
          topic,
        });
      } else if (currentSection === 'action items') {
        // Parse action item: "- [ ] Task - Assigned to: Name - Due: Date"
        const match = content.match(/^\[ \]\s*(.+?)\s*-\s*Assigned to:\s*(.+?)\s*-\s*Due:\s*(.+)$/);
        if (match) {
          data.actionItems.push({
            id: Date.now().toString() + Math.random(),
            task: match[1].trim(),
            assignedTo: match[2].trim(),
            dueDate: match[3].trim(),
          });
        }
      } else if (currentSection === 'next steps') {
        data.nextSteps.push({
          id: Date.now().toString() + Math.random(),
          step: content,
        });
      } else if (currentDiscussionTopic && currentSection === 'discussion points') {
        // Add point to current discussion topic
        const discussion = data.discussionPoints.find(d => d.id === currentDiscussionId);
        if (discussion) {
          discussion.points.push(content);
        }
      }
    } else if (line.match(/^\d+\.\s/)) {
      // Numbered list items (agenda)
      if (currentSection === 'agenda') {
        const topic = line.replace(/^\d+\.\s*/, '');
        data.agendaItems.push({
          id: Date.now().toString() + Math.random(),
          topic,
        });
      }
    } else if (line && currentSection === 'notes') {
      // Notes section - collect all text
      if (data.notes) {
        data.notes += '\n' + line;
      } else {
        data.notes = line;
      }
    }
  }

  return data;
}

/**
 * Check if a document is a meeting notes document
 */
export function isMeetingNotesDocument(content: string): boolean {
  // Check for meeting notes patterns
  const hasMeetingTitle = /^#\s+.+/.test(content);
  const hasDate = /##\s+Date:/.test(content);
  const hasAttendees = /###\s+Attendees/.test(content);
  const hasAgenda = /###\s+Agenda/.test(content);
  const hasActionItems = /###\s+Action Items/.test(content);

  return hasMeetingTitle && (hasDate || hasAttendees || hasAgenda || hasActionItems);
}

