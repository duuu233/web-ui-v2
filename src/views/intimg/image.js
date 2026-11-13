// 上传前的图片处理（浏览器端）：读尺寸 → 按产品旋转度数转好图片内容 → 校验正好等于画布尺寸。
// 旋转度数为 0 时原文件直接上传（不重新编码，保留原 PNG / JPG）；需要旋转时用 canvas 转好后导出 PNG。
import { checkUploadSize, rotatedSize } from './model'

const ACCEPT = ['image/png', 'image/jpeg']

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片无法读取，请换一张 PNG / JPG'))
    image.src = url
  })
}

function rotateToBlob(image, rotation) {
  const size = rotatedSize(image.naturalWidth, image.naturalHeight, rotation)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  context.translate(size.width / 2, size.height / 2)
  context.rotate((rotation * Math.PI) / 180)
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('图片旋转失败，请重试'))), 'image/png')
  })
}

// 返回 { file, previewUrl, sourceWidth, sourceHeight, rotation }；不合规抛出带提示的 Error。
// 调用方用完 previewUrl 要 URL.revokeObjectURL。
export async function prepareSlotImage(file, params) {
  if (!file) throw new Error('请选择图片')
  if (!ACCEPT.includes(file.type)) throw new Error('只支持 PNG / JPG 图片')
  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(sourceUrl)
    const problem = checkUploadSize(image.naturalWidth, image.naturalHeight, params)
    if (problem) throw new Error(problem)
    let output = file
    if (params.rotation) {
      const blob = await rotateToBlob(image, params.rotation)
      const name = file.name.replace(/\.[^.]+$/, '') + `-rot${params.rotation}.png`
      output = new File([blob], name, { type: 'image/png' })
    }
    return {
      file: output,
      previewUrl: URL.createObjectURL(output),
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      rotation: params.rotation
    }
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}
