// loader.js
import { enemyTypes } from './enemy.js';

export const loadedImages = {};

const imagesToLoad = [
    { id: 'player', path: 'images/player.png' },
    ...enemyTypes.map(type => ({ id: type.id, path: type.imagePath }))
];

export function loadImages(callback) {
    let loadedCount = 0;
    const totalImages = imagesToLoad.length;

    if (totalImages === 0) {
        callback();
        return;
    }

    imagesToLoad.forEach(imageInfo => {
        const img = new Image();
        img.src = imageInfo.path;
        img.onload = () => {
            loadedImages[imageInfo.id] = img;
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.error(`画像の読み込みに失敗: ${imageInfo.path}`);
            loadedCount++;
            if (loadedCount === totalImages) {
                callback();
            }
        };
    });
}