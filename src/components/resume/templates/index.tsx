import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';
import { Template4 } from './Template4';
import { Template5 } from './Template5';
import { ResumeData } from '@/types';

interface ResumeTemplateProps {
  templateId: string;
  data: ResumeData;
}

export function ResumeTemplate({ templateId, data }: ResumeTemplateProps) {
  switch (templateId) {
    case 'template1':
      return <Template1 data={data} />;
    case 'template2':
      return <Template2 data={data} />;
    case 'template3':
      return <Template3 data={data} />;
    case 'template4':
      return <Template4 data={data} />;
    case 'template5':
      return <Template5 data={data} />;
    default:
      return <Template1 data={data} />;
  }
}

