import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Document } from '@/types';

export async function exportToPDF(document: Document): Promise<void> {
  try {
    // Convert HTML content to PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h1, h2, h3 {
              margin-top: 24px;
              margin-bottom: 16px;
            }
            p {
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(document.title)}</h1>
          <div>${convertMarkdownToHTML(document.content)}</div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
      });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function convertMarkdownToHTML(markdown: string): string {
  // Escape HTML first
  let html = escapeHtml(markdown);
  
  // Convert markdown to HTML
  html = html
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li>.*?<\/li>)/gim, (match, p1) => {
    return `<ul>${match}</ul>`;
  });
  
  // Split by double newlines for paragraphs
  const lines = html.split(/\n\n+/);
  html = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // If it's already a heading or list, return as is
    if (trimmed.match(/^<[h|u|o]/)) {
      return trimmed;
    }
    // Otherwise wrap in paragraph
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).filter(l => l).join('\n');
  
  return html;
}

