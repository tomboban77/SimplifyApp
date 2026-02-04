/**
 * Template Renderer
 * 
 * Dynamically renders resume templates based on schema configuration from Firebase.
 * This replaces hardcoded Template1-5 components with a flexible, schema-driven system.
 */

import { View, Text, StyleSheet } from 'react-native';
import { ResumeData } from '@/types';
import { TemplateSchema, SectionConfig } from '@/types/templateSchema';

interface TemplateRendererProps {
  schema: TemplateSchema;
  data: ResumeData;
}

export function TemplateRenderer({ schema, data }: TemplateRendererProps) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections } = data;
  const { layout, colors, typography, spacing, header, sections } = schema;

  // Sort sections by order
  const sortedSections = [...sections]
    .filter(section => section.show)
    .sort((a, b) => a.order - b.order);

  // Render header
  const renderHeader = () => (
    <View style={[
      styles.header,
      { marginBottom: spacing.section }
    ]}>
      <Text style={[
        styles.name,
        {
          fontSize: typography.nameSize,
          fontWeight: typography.nameWeight,
          color: colors.text,
          textAlign: header.nameAlign,
        }
      ]}>
        {personalInfo.fullName || 'Your Name'}
      </Text>
      
      <View style={[
        styles.contactRow,
        { justifyContent: header.contactAlign === 'center' ? 'center' : header.contactAlign === 'right' ? 'flex-end' : 'flex-start' }
      ]}>
        {personalInfo.email && <Text style={[styles.contactItem, { color: colors.textSecondary || colors.text }]}>{personalInfo.email}</Text>}
        {personalInfo.phone && (
          <>
            <Text style={[styles.contactSeparator, { color: colors.textSecondary || colors.text }]}>|</Text>
            <Text style={[styles.contactItem, { color: colors.textSecondary || colors.text }]}>{personalInfo.phone}</Text>
          </>
        )}
        {personalInfo.location && (
          <>
            <Text style={[styles.contactSeparator, { color: colors.textSecondary || colors.text }]}>|</Text>
            <Text style={[styles.contactItem, { color: colors.textSecondary || colors.text }]}>{personalInfo.location}</Text>
          </>
        )}
      </View>
      
      {(header.showLinkedIn && personalInfo.linkedIn) || (header.showWebsite && personalInfo.website) ? (
        <View style={[
          styles.contactRow,
          { justifyContent: header.contactAlign === 'center' ? 'center' : header.contactAlign === 'right' ? 'flex-end' : 'flex-start' }
        ]}>
          {header.showLinkedIn && personalInfo.linkedIn && <Text style={[styles.contactItem, { color: colors.textSecondary || colors.text }]}>{personalInfo.linkedIn}</Text>}
          {header.showWebsite && personalInfo.website && (
            <>
              {header.showLinkedIn && personalInfo.linkedIn && <Text style={[styles.contactSeparator, { color: colors.textSecondary || colors.text }]}>|</Text>}
              <Text style={[styles.contactItem, { color: colors.textSecondary || colors.text }]}>{personalInfo.website}</Text>
            </>
          )}
        </View>
      ) : null}
    </View>
  );

  // Render section title
  const renderSectionTitle = (title: string) => (
    <>
      <Text style={[
        styles.sectionTitle,
        {
          fontSize: typography.sectionTitleSize,
          fontWeight: typography.sectionTitleWeight,
          color: colors.text,
          marginBottom: 4,
        }
      ]}>
        {title.toUpperCase()}
      </Text>
      <View style={[
        styles.divider, 
        { 
          backgroundColor: colors.divider || colors.primary || colors.text, 
          marginBottom: spacing.item 
        }
      ]} />
    </>
  );

  // Render experience section
  const renderExperience = (config: SectionConfig) => {
    if (!experience.length) return null;
    
    return (
      <View key="experience" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'PROFESSIONAL EXPERIENCE')}
        {experience.map((exp) => (
          <View key={exp.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryTitle, { fontSize: typography.bodySize + 1, fontWeight: 'bold', color: colors.text }]}>
                {exp.jobTitle}
              </Text>
              <Text style={[styles.entryDate, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text }]}>
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
              </Text>
            </View>
            <Text style={[styles.entrySubtitle, { fontSize: typography.bodySize, color: colors.textSecondary || colors.text }]}>
              {exp.company}{exp.location ? `, ${exp.location}` : ''}
            </Text>
            {exp.description.length > 0 && (
              <View style={styles.bulletList}>
                {exp.description.map((desc, idx) => (
                  <View key={idx} style={[styles.bulletItem, { marginLeft: spacing.bullet }]}>
                    <Text style={[styles.bullet, { color: colors.text }]}>•</Text>
                    <Text style={[styles.bulletText, { fontSize: typography.bodySize, color: colors.text }]}>{desc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render education section
  const renderEducation = (config: SectionConfig) => {
    if (!education.length) return null;
    
    return (
      <View key="education" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'EDUCATION')}
        {education.map((edu) => (
          <View key={edu.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryTitle, { fontSize: typography.bodySize + 1, fontWeight: 'bold', color: colors.text }]}>
                {edu.degree}
              </Text>
              <Text style={[styles.entryDate, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text }]}>
                {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
              </Text>
            </View>
            <Text style={[styles.entrySubtitle, { fontSize: typography.bodySize, color: colors.textSecondary || colors.text }]}>
              {edu.school}{edu.location ? `, ${edu.location}` : ''}
            </Text>
            {edu.description && edu.description.length > 0 && (
              <View style={styles.bulletList}>
                {edu.description.map((desc, idx) => (
                  <View key={idx} style={[styles.bulletItem, { marginLeft: spacing.bullet }]}>
                    <Text style={[styles.bullet, { color: colors.text }]}>•</Text>
                    <Text style={[styles.bulletText, { fontSize: typography.bodySize, color: colors.text }]}>{desc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render skills section
  const renderSkills = (config: SectionConfig) => {
    if (!skills.length) return null;
    
    return (
      <View key="skills" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'SKILLS')}
        {skills.map((skill) => (
          <View key={skill.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            <Text style={[styles.skillCategory, { fontSize: typography.bodySize, fontWeight: 'bold', color: colors.text }]}>
              {skill.category}:
            </Text>
            <Text style={[styles.skillItems, { fontSize: typography.bodySize, color: colors.textSecondary || colors.text }]}>
              {skill.items.join(', ')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render summary section
  const renderSummary = (config: SectionConfig) => {
    if (!personalInfo.summary) return null;
    
    return (
      <View key="summary" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'PROFESSIONAL SUMMARY')}
        <Text style={[styles.summaryText, { fontSize: typography.bodySize, color: colors.text, lineHeight: typography.bodySize * 1.5 }]}>
          {personalInfo.summary}
        </Text>
      </View>
    );
  };

  // Render projects section
  const renderProjects = (config: SectionConfig) => {
    if (!projects || !projects.length) return null;
    
    return (
      <View key="projects" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'PROJECTS')}
        {projects.map((project) => (
          <View key={project.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            {/* Project name - use exact styles from schema (matching Template1-5) */}
            <Text style={{
              fontSize: typography.projectNameSize || typography.entryTitleSize || 10, 
              fontWeight: typography.projectNameWeight || typography.entryTitleWeight || '700', 
              color: colors.text,
              marginBottom: 0,
              lineHeight: (typography.projectNameSize || typography.entryTitleSize || 10) * 1.2,
            }}>
              {project.name}
            </Text>
            {/* Project description - use exact styles from schema */}
            <Text style={[
              styles.projectDescription, 
              { 
                fontSize: typography.projectDescSize || typography.bodySize, 
                color: colors.textSecondary || colors.text, 
                marginTop: typography.projectDescMarginTop !== undefined ? typography.projectDescMarginTop : 2, 
                lineHeight: typography.projectDescLineHeight || (typography.bodySize * 1.4)
              }
            ]}>
              {project.description || ''}
            </Text>
            {project.technologies && project.technologies.length > 0 && (
              <Text style={[styles.skillItems, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text, marginTop: 4 }]}>
                Technologies: {project.technologies.join(', ')}
              </Text>
            )}
            {project.link && project.link.trim() && (
              <Text style={[styles.link, { fontSize: typography.bodySize - 1, color: colors.accent || colors.primary, marginTop: 2 }]}>
                {project.link}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render certifications section
  const renderCertifications = (config: SectionConfig) => {
    if (!certifications || !certifications.length) return null;
    
    return (
      <View key="certifications" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'CERTIFICATIONS')}
        {certifications.map((cert) => (
          <View key={cert.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryTitle, { fontSize: typography.bodySize, fontWeight: 'bold', color: colors.text }]}>
                {cert.name}
              </Text>
              <Text style={[styles.entryDate, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text }]}>
                {cert.date}
              </Text>
            </View>
            <Text style={[styles.entrySubtitle, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text }]}>
              {cert.issuer}
            </Text>
            {cert.link && (
              <Text style={[styles.link, { fontSize: typography.bodySize - 1, color: colors.accent || colors.primary, marginTop: 2 }]}>
                {cert.link}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render languages section
  const renderLanguages = (config: SectionConfig) => {
    if (!languages || !languages.length) return null;
    
    // Filter out any languages with missing data
    const validLanguages = languages.filter(lang => lang.language && lang.proficiency);
    if (validLanguages.length === 0) return null;
    
    return (
      <View key="languages" style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(config.title || 'LANGUAGES')}
        <View style={styles.languagesContainer}>
          {validLanguages.map((lang, index) => (
            <Text 
              key={lang.id || index} 
              style={[
                styles.languageItem, 
                { 
                  fontSize: typography.bodySize, 
                  color: colors.text,
                  marginBottom: index < validLanguages.length - 1 ? 4 : 0,
                }
              ]}
            >
              {lang.language} {lang.proficiency && `(${lang.proficiency})`}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Render custom sections
  const renderCustomSections = (config: SectionConfig) => {
    if (!customSections || !customSections.length) return null;
    
    return customSections.map((section) => (
      <View key={section.id} style={[styles.section, { marginBottom: spacing.section }]}>
        {renderSectionTitle(section.title)}
        {section.items.map((item) => (
          <View key={item.id} style={[styles.entryItem, { marginBottom: spacing.item }]}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryTitle, { fontSize: typography.bodySize, fontWeight: 'bold', color: colors.text }]}>
                {item.title}
              </Text>
              {item.date && (
                <Text style={[styles.entryDate, { fontSize: typography.bodySize - 1, color: colors.textSecondary || colors.text }]}>
                  {item.date}
                </Text>
              )}
            </View>
            {item.description && (
              <Text style={[styles.bulletText, { fontSize: typography.bodySize, color: colors.text, marginTop: 4 }]}>
                {item.description}
              </Text>
            )}
          </View>
        ))}
      </View>
    ));
  };

  // Render section based on type
  const renderSection = (config: SectionConfig) => {
    switch (config.type) {
      case 'personal-info':
        return null; // Handled by header
      case 'summary':
        return renderSummary(config);
      case 'experience':
        return renderExperience(config);
      case 'education':
        return renderEducation(config);
      case 'skills':
        return renderSkills(config);
      case 'projects':
        return renderProjects(config);
      case 'certifications':
        return renderCertifications(config);
      case 'languages':
        return renderLanguages(config);
      case 'custom-sections':
        return renderCustomSections(config);
      default:
        return null;
    }
  };

  // Render based on layout type
  if (layout.type === 'two-column') {
    const leftSections = sortedSections.filter(s => s.column === 'left' || (!s.column && s.type !== 'experience'));
    const rightSections = sortedSections.filter(s => s.column === 'right' || (!s.column && s.type === 'experience'));
    const fullSections = sortedSections.filter(s => s.column === 'full');

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        
        {fullSections.map(section => renderSection(section))}
        
        <View style={styles.twoColumnLayout}>
          <View style={[styles.column, { width: `${layout.leftColumnWidth || 65}%` }]}>
            {leftSections.map(section => renderSection(section))}
          </View>
          <View style={[styles.column, { width: `${layout.rightColumnWidth || 35}%` }]}>
            {rightSections.map(section => renderSection(section))}
          </View>
        </View>
      </View>
    );
  }

  // Single column layout (default)
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {sortedSections.map(section => renderSection(section))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    minHeight: 842, // A4 height at 72 DPI
    width: 595, // A4 width at 72 DPI
  },
  header: {
    marginBottom: 20,
  },
  name: {
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  contactItem: {
    fontSize: 11,
  },
  contactSeparator: {
    marginHorizontal: 8,
    fontSize: 11,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 4,
  },
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
    flex: 1,
  },
  entryDate: {
    marginLeft: 8,
  },
  entrySubtitle: {
    marginTop: 2,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
  },
  summaryText: {
    textAlign: 'justify',
  },
  skillCategory: {
    marginBottom: 2,
  },
  skillItems: {
    marginTop: 2,
  },
  projectDescription: {
    // Project description styling
  },
  link: {
    textDecorationLine: 'underline',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    // Width set dynamically
  },
  languagesContainer: {
    // Container for languages list
  },
  languageItem: {
    // Individual language item
  },
});

