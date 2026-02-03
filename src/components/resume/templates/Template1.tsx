import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';

interface Template1Props {
  data: ResumeData;
}

// Template 1: Classic Professional
// Clean, traditional black & white design trusted by Fortune 500 recruiters
// Single column, clear hierarchy, ATS-optimized

export function Template1({ data }: Template1Props) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.email && <Text style={styles.contactItem}>{personalInfo.email}</Text>}
          {personalInfo.phone && (
            <>
              <Text style={styles.contactSeparator}>|</Text>
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            </>
          )}
          {personalInfo.location && (
            <>
              <Text style={styles.contactSeparator}>|</Text>
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            </>
          )}
        </View>
        {(personalInfo.linkedIn || personalInfo.website) && (
          <View style={styles.contactRow}>
            {personalInfo.linkedIn && <Text style={styles.contactItem}>{personalInfo.linkedIn}</Text>}
            {personalInfo.website && (
              <>
                {personalInfo.linkedIn && <Text style={styles.contactSeparator}>|</Text>}
                <Text style={styles.contactItem}>{personalInfo.website}</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Summary */}
      {personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          <View style={styles.divider} />
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
          <View style={styles.divider} />
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.jobTitle}</Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {exp.company}{exp.location ? `, ${exp.location}` : ''}
              </Text>
              {exp.description.length > 0 && (
                <View style={styles.bulletList}>
                  {exp.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
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
          <Text style={styles.sectionTitle}>EDUCATION</Text>
          <View style={styles.divider} />
          {education.map((edu) => (
            <View key={edu.id} style={styles.entryItem}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.degree}</Text>
                <Text style={styles.entryDate}>
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>
                {edu.school}{edu.location ? `, ${edu.location}` : ''}
              </Text>
              {edu.description && edu.description.length > 0 && (
                <View style={styles.bulletList}>
                  {edu.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{desc}</Text>
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
          <Text style={styles.sectionTitle}>SKILLS</Text>
          <View style={styles.divider} />
          {skills.map((skill) => (
            <View key={skill.id} style={styles.skillRow}>
              <Text style={styles.skillCategory}>{skill.category}:</Text>
              <Text style={styles.skillItems}>{skill.items.join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROJECTS</Text>
          <View style={styles.divider} />
          {projects.map((project) => (
            <View key={project.id} style={styles.entryItem}>
              <Text style={styles.entryTitle}>{project.name}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              {project.technologies && project.technologies.length > 0 && (
                <Text style={styles.techStack}>
                  Technologies: {project.technologies.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
          <View style={styles.divider} />
          {certifications.map((cert) => (
            <View key={cert.id} style={styles.certRow}>
              <Text style={styles.certName}>{cert.name}</Text>
              <Text style={styles.certDetails}>{cert.issuer}, {cert.date}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LANGUAGES</Text>
          <View style={styles.divider} />
          <View style={styles.languageRow}>
            {languages.map((lang, index) => (
              <Text key={lang.id} style={styles.languageItem}>
                {lang.language} ({lang.proficiency}){index < languages.length - 1 ? '  •  ' : ''}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <>
          {customSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              <View style={styles.divider} />
              {section.items.map((item) => (
                <View key={item.id} style={styles.entryItem}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTitle}>{item.title}</Text>
                    {item.date && <Text style={styles.entryDate}>{item.date}</Text>}
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
    paddingHorizontal: 40,
    paddingVertical: 36,
  },
  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    fontSize: 9,
    color: '#333333',
  },
  contactSeparator: {
    fontSize: 9,
    color: '#666666',
    marginHorizontal: 8,
  },
  // Section Styles
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 14,
    color: '#333333',
    textAlign: 'justify',
  },
  // Entry Styles (Experience, Education)
  entryItem: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    fontSize: 9,
    color: '#333333',
    fontStyle: 'italic',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#333333',
    marginBottom: 4,
  },
  // Bullet Points
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingRight: 8,
  },
  bullet: {
    fontSize: 9,
    color: '#000000',
    marginRight: 6,
    lineHeight: 13,
  },
  bulletText: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
    lineHeight: 13,
  },
  // Skills
  skillRow: {
    flexDirection: 'row',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
    marginRight: 6,
  },
  skillItems: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
  },
  // Projects
  projectDescription: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 13,
    marginTop: 2,
  },
  techStack: {
    fontSize: 8,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 3,
  },
  // Certifications
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  certName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  certDetails: {
    fontSize: 9,
    color: '#333333',
  },
  // Languages
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageItem: {
    fontSize: 9,
    color: '#333333',
  },
});