export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

// 判断 2 个数组里面的值是否相等
export function isArr(arr1, arr2) {
  return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
}

export function getUrlKey(name, url) {
  return (
    decodeURIComponent(
      (
        new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [
          ,
          ''
        ]
      )[1].replace(/\+/g, '%20')
    ) || null
  )
}

// 通过 ID 查找当前项及其所有父级项（除去顶级项）
export function getCheckedClassifyParentId(data, id, arr, originalData) {
  data.forEach((item) => {
    if (item.value === id) {
      arr.push({
        parentId: item.parentId,
        id: item.value,
        text: item.text
      })
      if (item.parentId !== 0) {
        const _id = item.parentId
        const _data = originalData
        getCheckedClassifyParentId(_data, _id, arr, _data)
      }
    } else if (item.childs && item.childs.length) {
      getCheckedClassifyParentId(item.childs, id, arr, originalData)
    }
  })
}

// 父子级分类名称拼接
export function getClassifyName(arr, _this) {
  let str = ''
  arr.forEach((v) => {
    if (str) {
      str = v.text + '→' + str
    } else {
      str = v.text
    }
  })
  _this.classifyName = str
}

// 获取省-市 删除区
export function getCity(data) {
  if (data.length) {
    data.forEach((v) => {
      if (v.childs.length) {
        v.childs.forEach((value) => {
          delete value.childs
        })
      }
    })
  }
}

// 执行组合排列的函数
export function doExchange(arr) {
  const len = arr.length
  if (len >= 2) {
    const len1 = arr[0].length
    const len2 = arr[1].length
    const lenBoth = len1 * len2
    const items = new Array(lenBoth)
    let index = 0
    for (let i = 0; i < len1; i++) {
      for (let j = 0; j < len2; j++) {
        items[index] = arr[0][i] + '|' + arr[1][j]
        index++
      }
    }
    const newArr = new Array(len - 1)
    for (let i = 2; i < arr.length; i++) {
      newArr[i - 1] = arr[i]
    }
    newArr[0] = items
    return doExchange(newArr)
  } else {
    return arr[0]
  }
}
