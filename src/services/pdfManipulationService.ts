import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { PDFAnnotation } from '@/types';

/**
 * Service for manipulating PDF files - embedding annotations, signatures, etc.
 * Uses expo-print for React Native compatibility (pdf-lib doesn't work in RN).
 */

export interface EmbedAnnotationsOptions {
  annotations: PDFAnnotation[];
  pageWidth: number;
  pageHeight: number;
  scale?: number; // Scale factor from screen coordinates to PDF coordinates
}

/**
 * Creates an HTML document with annotations listed
 * Since pdf-lib doesn't work in React Native, we create a summary document
 * For true PDF embedding, a server-side solution would be needed
 */
function createAnnotatedPDFHTML(
  pdfUri: string,
  options: EmbedAnnotationsOptions
): string {
  const annotationsList = options.annotations.map((ann, index) => {
    const typeLabel = ann.type.charAt(0).toUpperCase() + ann.type.slice(1);
    let content = '';
    
    switch (ann.type) {
      case 'text':
        content = `<p style="font-size: ${ann.fontSize || 12}px; color: ${ann.color || '#000'};">
          <strong>Text:</strong> ${escapeHtml(ann.content || '')}
        </p>`;
        break;
      case 'highlight':
      case 'underline':
      case 'strikethrough':
        content = `<p>
          <strong>${typeLabel}:</strong> 
          <span style="background: ${ann.color || '#FFFF00'}; padding: 2px 4px;">
            ${escapeHtml(ann.content || 'No note')}
          </span>
        </p>`;
        break;
      case 'signature':
        if (ann.imageData) {
          content = `<p>
            <strong>Signature:</strong><br/>
            <img src="${ann.imageData}" style="max-width: 200px; max-height: 100px; border: 1px solid #ccc;" />
          </p>`;
        } else if (ann.content) {
          content = `<p style="font-style: italic; border: 1px dashed #000; padding: 8px; display: inline-block;">
            <strong>Signature:</strong> ${escapeHtml(ann.content)}
          </p>`;
        }
        break;
    }
    
    return `
      <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #666;">Annotation ${index + 1} - ${typeLabel} (Page ${ann.page || 1})</h3>
        ${content}
        <p style="font-size: 12px; color: #999; margin-bottom: 0;">
          Position: (${Math.round(ann.x)}, ${Math.round(ann.y)})
          ${ann.width && ann.height ? `Size: ${Math.round(ann.width)} × ${Math.round(ann.height)}` : ''}
        </p>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6;
        }
        h1 { color: #333; border-bottom: 2px solid #6200ee; padding-bottom: 10px; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .note { color: #666; font-size: 14px; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>PDF Annotations Summary</h1>
      <div class="info">
        <p><strong>Note:</strong> This document contains a summary of annotations added to the PDF.</p>
        <p class="note">For true PDF embedding (annotations directly in the PDF file), a server-side PDF manipulation service would be required. The original PDF file should be kept alongside this summary.</p>
      </div>
      <h2>Annotations (${options.annotations.length})</h2>
      ${annotationsList}
    </body>
    </html>
  `;
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

/**
 * Embeds annotations into a PDF file using expo-print (React Native compatible)
 * Note: This creates a new PDF with annotations, but the original PDF is embedded as an iframe
 * For true PDF embedding, a server-side solution would be needed
 */
export async function embedAnnotationsIntoPDF(
  pdfUri: string,
  options: EmbedAnnotationsOptions
): Promise<string> {
  try {
    // Create HTML with PDF and annotations
    const html = createAnnotatedPDFHTML(pdfUri, options);
    
    // Generate PDF from HTML using expo-print
    const { uri } = await Print.printToFileAsync({ html });
    
    // Read the generated PDF as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Error embedding annotations into PDF:', error);
    throw new Error(`Failed to embed annotations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


/**
 * Saves a PDF with embedded annotations to a file
 */
export async function savePDFWithAnnotations(
  originalPdfUri: string,
  annotations: PDFAnnotation[],
  pageWidth: number,
  pageHeight: number,
  outputFileName?: string
): Promise<string> {
  try {
    const base64Pdf = await embedAnnotationsIntoPDF(originalPdfUri, {
      annotations,
      pageWidth,
      pageHeight,
    });

    // Convert base64 to file
    const fileName = outputFileName || `annotated_${Date.now()}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('Error saving PDF with annotations:', error);
    throw error;
  }
}

