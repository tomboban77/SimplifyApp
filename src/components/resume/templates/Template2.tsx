import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';

interface Template2Props {
  data: ResumeData;
}

// Template 2: Modern Executive
// Sophisticated design with navy blue accents
// Perfect for senior professionals and leadership roles

export function Template2({ data }: Template2Props) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.headerLine} />
        <View style={styles.contactContainer}>
          {personalInfo.email && <Text style={styles.contactText}>{personalInfo.email}</Text>}
          {personalInfo.phone && <Text style={styles.contactText}>{personalInfo.phone}</Text>}
          {personalInfo.location && <Text style={styles.contactText}>{personalInfo.location}</Text>}
          {personalInfo.linkedIn && <Text style={styles.contactText}>{personalInfo.linkedIn}</Text>}
          {personalInfo.website && <Text style={styles.contactText}>{personalInfo.website}</Text>}
        </View>
      </View>

      {/* Summary */}
      {personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <View style={styles.entryLeft}>
                  <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.company}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</Text>
                </View>
                <Text style={styles.date}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.description.length > 0 && (
                <View style={styles.bulletList}>
                  {exp.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bullet}>▸</Text>
                      <Text style={styles.bulletText}>{desc}</Text>
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
          {education.map((edu) => (
            <View key={edu.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <View style={styles.entryLeft}>
                  <Text style={styles.jobTitle}>{edu.degree}</Text>
                  <Text style={styles.company}>{edu.school}{edu.location ? ` — ${edu.location}` : ''}</Text>
                </View>
                <Text style={styles.date}>
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </Text>
              </View>
              {edu.description && edu.description.length > 0 && (
                <View style={styles.bulletList}>
                  {edu.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bullet}>▸</Text>
                      <Text style={styles.bulletText}>{desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Two Column Layout for Skills & Additional Info */}
      {(skills.length > 0 || (certifications && certifications.length > 0) || (languages && languages.length > 0)) && (
        <View style={styles.twoColumnSection}>
          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.columnLeft}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillGroup}>
                  <Text style={styles.skillCategory}>{skill.category}</Text>
                  <Text style={styles.skillItems}>{skill.items.join('  •  ')}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Right Column: Certifications, Languages */}
          {((certifications && certifications.length > 0) || (languages && languages.length > 0)) && (
            <View style={styles.columnRight}>
              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <View style={styles.miniSection}>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  {certifications.map((cert) => (
                    <View key={cert.id} style={styles.certItem}>
                      <Text style={styles.certName}>{cert.name}</Text>
                      <Text style={styles.certDetails}>{cert.issuer}, {cert.date}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <View style={styles.miniSection}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                  {languages.map((lang) => (
                    <Text key={lang.id} style={styles.languageItem}>
                      {lang.language} — {lang.proficiency}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((project) => (
            <View key={project.id} style={styles.projectItem}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              {project.technologies && project.technologies.length > 0 && (
                <Text style={styles.projectTech}>{project.technologies.join('  •  ')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <>
          {customSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.id} style={styles.entryItem}>
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
    paddingHorizontal: 36,
    paddingVertical: 32,
  },
  // Header
  header: {
    marginBottom: 18,
  },
  name: {
    fontSize: 26,
    fontWeight: '300',
    color: '#1e3a5f',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerLine: {
    height: 3,
    backgroundColor: '#1e3a5f',
    marginBottom: 10,
  },
  contactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactText: {
    fontSize: 8,
    color: '#555555',
    marginRight: 4,
  },
  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a5f',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d8e0',
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 14,
    color: '#333333',
  },
  // Entry Items
  entryItem: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  entryLeft: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 1,
  },
  company: {
    fontSize: 9,
    color: '#555555',
  },
  date: {
    fontSize: 8,
    color: '#777777',
  },
  // Bullets
  bulletList: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    fontSize: 8,
    color: '#1e3a5f',
    marginRight: 6,
    lineHeight: 13,
  },
  bulletText: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
    lineHeight: 13,
  },
  // Two Column Layout
  twoColumnSection: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  columnLeft: {
    flex: 1.2,
    marginRight: 20,
  },
  columnRight: {
    flex: 0.8,
  },
  miniSection: {
    marginBottom: 10,
  },
  // Skills
  skillGroup: {
    marginBottom: 8,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  skillItems: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 12,
  },
  // Certifications
  certItem: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1e3a5f',
  },
  certDetails: {
    fontSize: 8,
    color: '#555555',
  },
  // Languages
  languageItem: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 3,
  },
  // Projects
  projectItem: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 13,
  },
  projectTech: {
    fontSize: 8,
    color: '#666666',
    marginTop: 3,
  },
});