/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  iconLink?: string;
  createdTime?: string;
}

/**
 * List files from the user's Google Drive.
 */
export async function listDriveFiles(accessToken: string, search: string = ''): Promise<DriveFile[]> {
  try {
    let q = "trashed = false";
    if (search) {
      q += ` and name contains '${search.replace(/'/g, "\\'")}'`;
    }
    
    const fields = 'files(id,name,mimeType,size,thumbnailLink,iconLink,createdTime)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=30&orderBy=createdTime%20desc`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Google Drive: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    throw error;
  }
}

/**
 * Delete a file on Google Drive (requires UI confirmation prior to call).
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao eliminar ficheiro: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting Drive file:', error);
    throw error;
  }
}

/**
 * Create a new folder on Google Drive.
 */
export async function createDriveFolder(accessToken: string, folderName: string): Promise<DriveFile> {
  try {
    const url = 'https://www.googleapis.com/drive/v3/files';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar pasta: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Drive folder:', error);
    throw error;
  }
}

/**
 * Upload a text file or manual summary to Google Drive.
 */
export async function uploadDriveFile(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  parentFolderId?: string
): Promise<DriveFile> {
  try {
    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    // Multipart upload
    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${mimeType}\r\n\r\n`,
      content,
      closeDelimiter
    ].join('');

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload para o Google Drive: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw error;
  }
}

/**
 * Get file content (works mainly for text/json; returns URL link or blob for media)
 */
export async function downloadDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter conteúdo do ficheiro: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error downloading file content:', error);
    throw error;
  }
}
