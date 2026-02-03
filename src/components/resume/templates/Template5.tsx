import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';

interface Template5Props {
  data: ResumeData;
}

// Template 5: Professional Bold
// Eye-catching design with red accent header
// Clean sections with subtle backgrounds

export function Template5({ data }: Template5Props) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
          <View style={styles.contactInfo}>
            {personalInfo.email && <Text style={styles.contact}>{personalInfo.email}</Text>}
            {personalInfo.phone && (
              <>
                <Text style={styles.contactSep}>|</Text>
                <Text style={styles.contact}>{personalInfo.phone}</Text>
              </>
            )}
            {personalInfo.location && (
              <>
                <Text style={styles.contactSep}>|</Text>
                <Text style={styles.contact}>{personalInfo.location}</Text>
              </>
            )}
          </View>
          {(personalInfo.linkedIn || personalInfo.website) && (
            <View style={styles.links}>
              {personalInfo.linkedIn && <Text style={styles.link}>{personalInfo.linkedIn}</Text>}
              {personalInfo.website && (
                <>
                  {personalInfo.linkedIn && <Text style={styles.linkSep}>•</Text>}
                  <Text style={styles.link}>{personalInfo.website}</Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Summary */}
      {personalInfo.summary && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          </View>
          <Text style={styles.summaryText}>{personalInfo.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
          </View>
          {experience.map((exp) => (
            <View key={exp.id} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View style={styles.experienceLeft}>
                  <Text style={styles.jobTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.company}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</Text>
                </View>
                <Text style={styles.date}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </Text>
              </View>
              {exp.description.length > 0 && (
                <View style={styles.descriptionList}>
                  {exp.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletRow}>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
          </View>
          {education.map((edu) => (
            <View key={edu.id} style={styles.educationItem}>
              <View style={styles.educationHeader}>
                <View style={styles.educationLeft}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.school}>{edu.school}{edu.location ? ` • ${edu.location}` : ''}</Text>
                </View>
                <Text style={styles.date}>
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </Text>
              </View>
              {edu.description && edu.description.length > 0 && (
                <View style={styles.descriptionList}>
                  {edu.description.map((desc, idx) => (
                    <View key={idx} style={styles.bulletRow}>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
          </View>
          <View style={styles.skillsContainer}>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.skillItem}>
                <Text style={styles.skillCategory}>{skill.category}:</Text>
                <Text style={styles.skillItems}>{skill.items.join(', ')}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
          </View>
          {projects.map((project) => (
            <View key={project.id} style={styles.projectItem}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              {project.technologies && project.technologies.length > 0 && (
                <Text style={styles.projectTech}>Tech: {project.technologies.join(', ')}</Text>
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
            <View style={styles.bottomSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
              </View>
              {certifications.map((cert) => (
                <Text key={cert.id} style={styles.certText}>
                  {cert.name} — {cert.issuer}, {cert.date}
                </Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View style={styles.bottomSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>LANGUAGES</Text>
              </View>
              <Text style={styles.languageText}>
                {languages.map(lang => `${lang.language} (${lang.proficiency})`).join('  •  ')}
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              </View>
              {section.items.map((item) => (
                <View key={item.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
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
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  // Header
  header: {
    backgroundColor: '#c62828',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: -24,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contact: {
    fontSize: 9,
    color: '#ffffff',
  },
  contactSep: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: 6,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  link: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
  },
  linkSep: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 8,
  },
  // Sections
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: '#fafafa',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#c62828',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c62828',
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 13,
    color: '#333333',
  },
  // Experience
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  experienceLeft: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  company: {
    fontSize: 9,
    color: '#555555',
  },
  date: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
  },
  descriptionList: {
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 9,
    color: '#c62828',
    marginRight: 6,
    lineHeight: 12,
  },
  bulletText: {
    fontSize: 8,
    color: '#333333',
    flex: 1,
    lineHeight: 12,
  },
  // Education
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  educationLeft: {
    flex: 1,
    marginRight: 8,
  },
  degree: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 1,
  },
  school: {
    fontSize: 9,
    color: '#555555',
  },
  // Skills
  skillsContainer: {
    gap: 4,
  },
  skillItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 6,
  },
  skillItems: {
    fontSize: 8,
    color: '#444444',
    flex: 1,
  },
  // Projects
  projectItem: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 12,
  },
  projectTech: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bottomSection: {
    flex: 1,
    marginBottom: 12,
  },
  certText: {
    fontSize: 8,
    color: '#333333',
    marginBottom: 2,
  },
  languageText: {
    fontSize: 8,
    color: '#333333',
  },
});