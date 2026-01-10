import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

export async function parsePDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

export async function parseDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
      messages: result.messages
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

export async function parseFile(filePath, fileType) {
  if (fileType === 'pdf') {
    return await parsePDF(filePath);
  } else if (fileType === 'docx') {
    return await parseDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

