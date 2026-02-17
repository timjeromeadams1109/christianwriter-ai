import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface ExportContent {
  title: string;
  content: string;
  type: 'devotional' | 'sermon' | 'social';
  scripture?: string;
  createdAt?: string;
}

export async function exportToWord(data: ExportContent): Promise<void> {
  const paragraphs: Paragraph[] = [];

  // Title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.title,
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    })
  );

  // Metadata
  if (data.scripture) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Scripture: ${data.scripture}`,
            italics: true,
            color: '666666',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`,
          color: '666666',
          size: 20,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Content - split by newlines and create paragraphs
  const contentLines = data.content.split('\n');
  for (const line of contentLines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      paragraphs.push(new Paragraph({ spacing: { after: 200 } }));
      continue;
    }

    // Check if it's a heading (starts with # or **)
    if (trimmedLine.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.replace(/^#+ /, ''),
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmedLine.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.replace(/^#+ /, ''),
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 200 },
        })
      );
    } else if (trimmedLine.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.replace(/^#+ /, ''),
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // Bullet points
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.replace(/^[-*] /, ''),
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else if (/^\d+\. /.test(trimmedLine)) {
      // Numbered lists
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  }

  // Footer
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `\n\nGenerated with ChristianWriter.ai`,
          italics: true,
          color: '999999',
          size: 18,
        }),
      ],
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`;
  saveAs(blob, fileName);
}

export function exportToText(data: ExportContent): void {
  const text = `${data.title}\n${'='.repeat(data.title.length)}\n\n${
    data.scripture ? `Scripture: ${data.scripture}\n` : ''
  }Type: ${data.type}\n\n${data.content}\n\n---\nGenerated with ChristianWriter.ai`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const fileName = `${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
  saveAs(blob, fileName);
}
