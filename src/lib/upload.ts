/**
 * Утилиты для загрузки файлов
 */

/**
 * Загружает изображение и возвращает публичный URL
 *
 * В production это должно загружать на облачное хранилище (S3, Cloudinary и т.д.)
 * Пока используем простую загрузку в /public/uploads
 */
export async function uploadImage(file: File): Promise<string> {
  // Создаём FormData для загрузки
  const formData = new FormData();
  formData.append('file', file);

  // Отправляем на наш API endpoint для загрузки
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.url; // Публичный URL загруженного файла
}

/**
 * Конвертирует File в base64 (для прямой отправки в API)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Конвертирует File в Buffer для серверной обработки
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
