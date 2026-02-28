// src/lib/file-storage.ts
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveBase64Image(base64Image: string, subDir: string = 'attendance') {
  try {
    // Remove base64 prefix if exists
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    const fileName = `${uuidv4()}.jpg`;
    const absolutePath = path.join(process.cwd(), 'public', 'uploads', subDir, fileName); 
    const dir = path.dirname(absolutePath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, base64Data, { encoding: 'base64' });
    
    return {
      imageUrl: `/uploads/${subDir}/${fileName}`,
      fileName
    };
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw new Error('Failed to save image');
  }
}
