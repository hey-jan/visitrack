import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveBase64Image(base64Data: string, subDir: 'facial-data' | 'snapshots' | 'students') {
  try {
    // Remove data:image/jpeg;base64, from the string
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) return null;

    const fileName = `${uuidv4()}.jpg`;
    const relativePath = `/uploads/${subDir}/${fileName}`;
    const absolutePath = path.join(process.cwd(), 'public', 'uploads', subDir, fileName);

    fs.writeFileSync(absolutePath, base64Image, { encoding: 'base64' });

    return relativePath;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
}
