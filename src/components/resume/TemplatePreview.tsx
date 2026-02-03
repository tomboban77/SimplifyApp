import { View, StyleSheet, Dimensions } from 'react-native';
import { ResumeTemplate } from './templates';
import { ResumeData } from '@/types';

const { width } = Dimensions.get('window');

// Preview container dimensions - larger preview
const containerWidth = width - 48; // More width for preview
const containerHeight = 420; // Taller preview

// Original resume dimensions (A4)
const originalWidth = 595;
const originalHeight = 842;

// Calculate scale to fit - use more of the container
const scaleX = containerWidth / originalWidth;
const scaleY = containerHeight / originalHeight;
const scale = Math.min(scaleX, scaleY) * 0.98; // 98% to maximize size

// Professional sample data for preview
const sampleData: ResumeData = {
  personalInfo: {
    fullName: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/sarahmitchell',
    website: 'sarahmitchell.dev',
    summary:
      'Results-driven software engineer with 6+ years of experience building scalable web applications. Led cross-functional teams to deliver products serving millions of users. Passionate about clean code and mentoring junior developers.',
  },
  experience: [
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021',
      endDate: 'Present',
      current: true,
      description: [
        'Architected microservices platform handling 10M+ daily requests',
        'Led team of 6 engineers, improving sprint velocity by 35%',
        'Reduced infrastructure costs by $200K annually through optimization',
      ],
    },
    {
      id: '2',
      jobTitle: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      startDate: 'Jun 2018',
      endDate: 'Feb 2021',
      current: false,
      description: [
        'Built React Native mobile app with 500K+ downloads',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
    },
  ],
  education: [
    {
      id: '1',
      degree: 'M.S. Computer Science',
      school: 'Stanford University',
      location: 'Stanford, CA',
      startDate: '2016',
      endDate: '2018',
      current: false,
    },
    {
      id: '2',
      degree: 'B.S. Computer Science',
      school: 'UC Berkeley',
      location: 'Berkeley, CA',
      startDate: '2012',
      endDate: '2016',
      current: false,
    },
  ],
  skills: [
    {
      id: '1',
      category: 'Languages',
      items: ['TypeScript', 'Python', 'Go', 'SQL'],
    },
    {
      id: '2',
      category: 'Frameworks',
      items: ['React', 'Node.js', 'Django', 'GraphQL'],
    },
    {
      id: '3',
      category: 'Cloud',
      items: ['AWS', 'Docker', 'Kubernetes'],
    },
  ],
  projects: [],
  certifications: [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  languages: [
    {
      id: '1',
      language: 'English',
      proficiency: 'Native',
    },
    {
      id: '2',
      language: 'Spanish',
      proficiency: 'Professional',
    },
  ],
  customSections: [],
};

interface TemplatePreviewProps {
  templateId: string;
}

export function TemplatePreview({ templateId }: TemplatePreviewProps) {
  const scaledWidth = originalWidth * scale;
  const scaledHeight = originalHeight * scale;

  const offsetX = (containerWidth - scaledWidth) / 2;
  const offsetY = (containerHeight - scaledHeight) / 2;

  const translateX = (originalWidth * (1 - scale)) / 2;
  const translateY = (originalHeight * (1 - scale)) / 2;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.clipContainer, { width: containerWidth, height: containerHeight }]}>
        <View
          style={[
            styles.resumeCard,
            {
              width: originalWidth,
              height: originalHeight,
              position: 'absolute',
              left: offsetX,
              top: offsetY,
              transform: [
                { translateX: -translateX },
                { translateY: -translateY },
                { scale },
              ],
            },
          ]}
        >
          <ResumeTemplate templateId={templateId} data={sampleData} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  clipContainer: {
    overflow: 'hidden',
  },
  resumeCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});