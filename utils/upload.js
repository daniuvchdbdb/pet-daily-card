const UPLOAD_TIMEOUT = 5000;

function extFromPath(path) {
  const match = /\.([a-zA-Z0-9]+)(\?|#)?/.exec(path || '');
  return match ? match[1] : 'jpg';
}

function withUploadTimeout(promise, ms = UPLOAD_TIMEOUT, label = 'upload image') {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`${label} timeout`);
      error.code = 'UPLOAD_TIMEOUT';
      console.warn(`[cloud] ${label} timeout after ${ms}ms`);
      reject(error);
    }, ms);
  });

  return Promise.race([
    promise.then((value) => {
      clearTimeout(timer);
      return value;
    }).catch((error) => {
      clearTimeout(timer);
      console.warn(`[cloud] ${label} failed`, error);
      throw error;
    }),
    timeout
  ]);
}

async function uploadImageToCloud(filePath, folder = 'uploads') {
  if (!filePath) {
    throw new Error('请选择要上传的图片');
  }

  const cloudPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extFromPath(filePath)}`;
  const result = await withUploadTimeout(wx.cloud.uploadFile({
    cloudPath,
    filePath
  }), UPLOAD_TIMEOUT, `upload ${folder}`);

  if (!result || !result.fileID) {
    throw new Error('云端上传失败，请检查云存储配置。');
  }

  return result.fileID;
}

async function tryUploadImageToCloud(filePath, folder = 'uploads') {
  try {
    const fileID = await uploadImageToCloud(filePath, folder);
    return { ok: true, fileID, filePath, error: null };
  } catch (error) {
    return { ok: false, fileID: '', filePath, error };
  }
}

module.exports = {
  uploadImageToCloud,
  tryUploadImageToCloud
};
