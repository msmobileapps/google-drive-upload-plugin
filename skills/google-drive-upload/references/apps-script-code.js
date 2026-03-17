/**
 * Claude ‚Üí Google Drive Upload API
 *
 * Deploy this as a Google Apps Script Web App to enable
 * direct file uploads from Claude (Cowork / Claude Code) to your Google Drive.
 *
 * Built by MSApps (https://msapps.mobi)
 * Free for the community.
 */

// ===== CONFIGURATION =====
const CONFIG = {
  API_KEY: 'CHANGE_ME_TO_A_RANDOM_STRING', // Generate your own: https://www.uuidgenerator.net/
  MAX_FILE_SIZE_MB: 50,
  DEFAULT_FOLDER: 'root' // 'root' = My Drive root
};

/**
 * Handle GET requests (list folders, health check)
 */
function doGet(e) {
  const action = e.parameter.action || 'health';
  try {
    switch (action) {
      case 'list_folders':
        return jsonResponse(listFolders(e.parameter.folderId));
      case 'health':
        return jsonResponse({ success: true, message: 'Claude Drive Upload API is running', version: '1.0.0' });
      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Handle POST requests (file uploads)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate API key
    if (data.apiKey !== CONFIG.API_KEY) {
      return jsonResponse({ success: false, error: 'Invalid API key' });
    }

    // Validate required fields
    if (!data.fileName || !data.content) {
      return jsonResponse({ success: false, error: 'Missing required fields: fileName, content' });
    }

    // Check file size (base64 is ~33% larger than original)
    const estimatedSizeMB = (data.content.length * 0.75) / (1024 * 1024);
    if (estimatedSizeMB > CONFIG.MAX_FILE_SIZE_MB) {
      return jsonResponse({
        success: false,
        error: 'File too large. Max size: ' + CONFIG.MAX_FILE_SIZE_MB + 'MB, got: ' + Math.round(estimatedSizeMB) + 'MB'
      });
    }

    // Determine target folder
    let folder;
    if (data.folderId) {
      folder = DriveApp.getFolderById(data.folderId);
    } else if (data.folderPath) {
      folder = getOrCreateFolderByPath(data.folderPath);
    } else {
      folder = DriveApp.getRootFolder();
    }

    // Handle replaceExisting flag
    if (data.replaceExisting) {
      const existingFiles = folder.getFilesByName(data.fileName);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
    }

    // Decode base64 and create file
    const decoded = Utilities.base64Decode(data.content);
    const blob = Utilities.newBlob(decoded, data.mimeType || 'application/octet-stream', data.fileName);
    const file = folder.createFile(blob);

    return jsonResponse({
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      folderName: folder.getName() === 'My Drive' ? 'My Drive' : folder.getName(),
      size: file.getSize()
    });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * Navigate folder path, creating folders as needed
 */
function getOrCreateFolderByPath(path) {
  const parts = path.split('/').filter(p => p.trim() !== '');
  let current = DriveApp.getRootFolder();
  for (const part of parts) {
    const folders = current.getFoldersByName(part);
    if (folders.hasNext()) {
      current = folders.next();
    } else {
      current = current.createFolder(part);
    }
  }
  return current;
}

/**
 * List subfolders of a given folder (or root)
 */
function listFolders(parentId) {
  const parent = parentId ? DriveApp.getFolderById(parentId) : DriveApp.getRootFolder();
  const folders = parent.getFolders();
  const result = [];
  while (folders.hasNext()) {
    const f = folders.next();
    result.push({ id: f.getId(), name: f.getName() });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return {
    success: true,
    parentId: parent.getId(),
    parentName: parent.getName(),
    folders: result
  };
}

/**
 * Helper: return JSON response
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
