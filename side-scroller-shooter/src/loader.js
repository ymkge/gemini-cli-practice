// loader.js
import { enemyTypes } from './enemy.js';

export const enemyImages = {};

export function loadImages(callback) {
    let loadedCount = 0;
    const totalImages = enemyTypes.length;

    if (totalImages === 0) {
        callback();
        return;
    }

    enemyTypes.forEach(type => {
        const img = new Image();
        img.src = type.src;
        img.onload = () => {
            enemyImages[type.id] = img;
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.error(`画像の読み込みに失敗: ${type.src}`);
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
    });
}
