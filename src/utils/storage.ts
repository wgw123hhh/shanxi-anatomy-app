// 基于 uni storage 的本地持久化封装

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const v = uni.getStorageSync(key);
    if (v === '' || v === null || v === undefined) return defaultValue;
    return v as T;
  } catch (e) {
    console.error('getStorage error', key, e);
    return defaultValue;
  }
}

export function setStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    console.error('setStorage error', key, e);
  }
}
