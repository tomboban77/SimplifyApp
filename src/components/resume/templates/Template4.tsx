import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';

interface Template4Props {
  data: ResumeData;
}

// Template 4: Corporate Traditional
// Classic, authoritative design inspired by traditional serif resumes
// Perfect for law, finance, consulting, and corporate roles

export function Template4({ data }: Template4Props) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  return (
    <View style={styles.container}>
      {/* Header - Centered Traditional */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personalInfo.location && (
            <Text style={styles.contactText}>{personalInfo.location}</Text>
          )}
        </View>
        <View style={styles.contactRow}>
          {personalInfo.phone && <Text style={styles.contactText}>{personalInfo.phone}</Text>}
          {personalInfo.phone && personalInfo.email && <Text style={styles.contactDot}>  •  </Text>}
          {personalInfo.email && <Text style={styles.contactText}>{personalInfo.email}</Text>}
        </View>
        {(personalInfo.linkedIn || personalInfo.website) && (
          <View style={styles.contactRow}>
            {personalInfo.linkedIn && <Text style={styles.contactText}>{personalInfo.linkedIn}</Text>}
            {personalInfo.linkedIn && personalInfo.website && <Text style={styles.contactDot}>  •  </Text>}
            {personalInfo.website && <Text style={styles.contactText}>{personalInfo.website}</Text>}
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.headerDivider} />

      {/* Summary */}
      {personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL PROFILE</Text>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.entryItem}>
              <Text style={styles.companyName}>{exp.company}</Text>
              <View style={styles.titleRow}>
                <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                <Text style={styles.date}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.location && <Text style={styles.location}>{exp.location}</Text>}
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
          {education.map((edu) => (
            <View key={edu.id} style={styles.entryItem}>
              <Text style={styles.companyName}>{edu.school}</Text>
              <View style={styles.titleRow}>
                <Text style={styles.jobTitle}>{edu.degree}</Text>
                <Text style={styles.date}>
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </Text>
              </View>
              {edu.location && <Text style={styles.location}>{edu.location}</Text>}
              {edu.description && edu.description.length > 0 && (
                <View style={styles.descriptionList}>
                  {edu.description.map((desc, idx) => (
                    <Text key={idx} style={styles.descriptionText}>{desc}</Text>
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
          <Text style={styles.sectionTitle}>CORE COMPETENCIES</Text>
          <View style={styles.skillsGrid}>
            {skills.flatMap((skill) => skill.items).map((item, index) => (
              <Text key={index} style={styles.skillItem}>•  {item}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CERTIFICATIONS & LICENSES</Text>
          {certifications.map((cert) => (
            <View key={cert.id} style={styles.certItem}>
              <View style={styles.titleRow}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.date}>{cert.date}</Text>
              </View>
              <Text style={styles.certIssuer}>{cert.issuer}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KEY PROJECTS</Text>
          {projects.map((project) => (
            <View key={project.id} style={styles.entryItem}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDesc}>{project.description}</Text>
              {project.technologies && project.technologies.length > 0 && (
                <Text style={styles.projectTech}>Technologies: {project.technologies.join(', ')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LANGUAGES</Text>
          <View style={styles.languageRow}>
            {languages.map((lang, index) => (
              <Text key={lang.id} style={styles.languageItem}>
                {lang.language} ({lang.proficiency}){index < languages.length - 1 ? '   •   ' : ''}
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
              {section.items.map((item) => (
                <View key={item.id} style={styles.entryItem}>
                  <View style={styles.titleRow}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    {item.date && <Text style={styles.date}>{item.date}</Text>}
                  </View>
                  {item.description && (
                    <Text style={styles.projectDesc}>{item.description}</Text>
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
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 9,
    color: '#333333',
  },
  contactDot: {
    fontSize: 9,
    color: '#666666',
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  // Sections
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1.5,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 3,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 14,
    color: '#333333',
    textAlign: 'justify',
  },
  // Entry Items
  entryItem: {
    marginBottom: 12,
  },
  companyName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#222222',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 8,
    color: '#444444',
  },
  location: {
    fontSize: 8,
    color: '#555555',
    marginBottom: 4,
  },
  // Bullets
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    fontSize: 9,
    color: '#000000',
    marginRight: 8,
    lineHeight: 13,
  },
  bulletText: {
    fontSize: 9,
    color: '#333333',
    flex: 1,
    lineHeight: 13,
  },
  // Description (for education)
  descriptionList: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 8,
    color: '#444444',
    marginBottom: 2,
  },
  // Skills Grid
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    fontSize: 9,
    color: '#333333',
    width: '33%',
    marginBottom: 4,
  },
  // Certifications
  certItem: {
    marginBottom: 8,
  },
  certName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
  },
  certIssuer: {
    fontSize: 8,
    color: '#555555',
  },
  // Projects
  projectName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 8,
    color: '#333333',
    lineHeight: 12,
  },
  projectTech: {
    fontSize: 8,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 3,
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