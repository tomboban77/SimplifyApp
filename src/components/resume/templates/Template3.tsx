import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';

interface Template3Props {
  data: ResumeData;
}

// Template 3: Minimalist Clean
// Ultra-clean design with elegant whitespace
// Focuses entirely on content with subtle typography

export function Template3({ data }: Template3Props) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  return (
    <View style={styles.container}>
      {/* Header - Clean and Simple */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactLine}>
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedIn,
            personalInfo.website,
          ]
            .filter(Boolean)
            .map((item, index, array) => (
              <Text key={index} style={styles.contactText}>
                {item}{index < array.length - 1 ? '   ·   ' : ''}
              </Text>
            ))}
        </View>
      </View>

      {/* Summary */}
      {personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp, expIndex) => (
            <View key={exp.id} style={[styles.entryItem, expIndex === experience.length - 1 && styles.lastEntry]}>
              <View style={styles.entryHeader}>
                <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={styles.date}>
                  {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              <Text style={styles.company}>{exp.company}</Text>
              {exp.description.length > 0 && (
                <View style={styles.bulletList}>
                  {exp.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bulletText}>– {desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, eduIndex) => (
            <View key={edu.id} style={[styles.entryItem, eduIndex === education.length - 1 && styles.lastEntry]}>
              <View style={styles.entryHeader}>
                <Text style={styles.jobTitle}>{edu.degree}</Text>
                <Text style={styles.date}>
                  {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                </Text>
              </View>
              <Text style={styles.company}>{edu.school}</Text>
              {edu.description && edu.description.length > 0 && (
                <View style={styles.bulletList}>
                  {edu.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bulletText}>– {desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}</Text>
                <Text style={styles.skillItems}>{skill.items.join(',  ')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((project, projIndex) => (
            <View key={project.id} style={[styles.entryItem, projIndex === projects.length - 1 && styles.lastEntry]}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              {project.technologies && project.technologies.length > 0 && (
                <Text style={styles.techText}>{project.technologies.join(',  ')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Bottom Row: Certifications & Languages */}
      {((certifications && certifications.length > 0) || (languages && languages.length > 0)) && (
        <View style={styles.bottomRow}>
          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <View style={styles.bottomColumn}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              {certifications.map((cert) => (
                <Text key={cert.id} style={styles.certText}>
                  {cert.name} — {cert.issuer}, {cert.date}
                </Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View style={styles.bottomColumn}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <Text style={styles.languageText}>
                {languages.map((lang) => `${lang.language} (${lang.proficiency})`).join(',  ')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <>
          {customSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View key={item.id} style={[styles.entryItem, itemIndex === section.items.length - 1 && styles.lastEntry]}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    {item.date && <Text style={styles.date}>{item.date}</Text>}
                  </View>
                  {item.description && (
                    <Text style={styles.projectDescription}>{item.description}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 44,
    paddingVertical: 40,
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  contactLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactText: {
    fontSize: 8,
    color: '#666666',
    letterSpacing: 0.3,
  },
  // Sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 15,
    color: '#333333',
    fontStyle: 'italic',
  },
  // Entry Items
  entryItem: {
    marginBottom: 14,
  },
  lastEntry: {
    marginBottom: 0,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  company: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 4,
  },
  date: {
    fontSize: 8,
    color: '#888888',
  },
  // Bullets
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    marginBottom: 3,
  },
  bulletText: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 13,
    paddingLeft: 2,
  },
  // Skills
  skillsContainer: {
    gap: 6,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
    width: 80,
  },
  skillItems: {
    fontSize: 8,
    color: '#444444',
    flex: 1,
    lineHeight: 13,
  },
  // Projects
  projectName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 13,
  },
  techText: {
    fontSize: 8,
    color: '#888888',
    marginTop: 4,
  },
  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bottomColumn: {
    flex: 1,
    marginRight: 20,
  },
  certText: {
    fontSize: 8,
    color: '#444444',
    marginBottom: 3,
  },
  languageText: {
    fontSize: 8,
    color: '#444444',
  },
});