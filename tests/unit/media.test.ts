import { describe, expect, test } from 'vitest';
import { GIF_MAX_SECONDS } from '../../src/converter/media/formats';
import { gifSize, gifTimestamps } from '../../src/converter/media/gif';
import { scaledSize } from '../../src/converter/media/video';

describe('видео: размер кадра', () => {
  test('«720p» — короткая сторона (у вертикального видео — ширина), стороны чётные, только уменьшение', () => {
    expect(scaledSize(1920, 1080, 720)).toEqual({ width: 1280, height: 720 });
    expect(scaledSize(1080, 1920, 720)).toEqual({ width: 720, height: 1280 });
    expect(scaledSize(1280, 720, 480)).toEqual({ width: 854, height: 480 });
    expect(scaledSize(1440, 1080, 480)).toEqual({ width: 640, height: 480 });
    expect(scaledSize(1280, 720, 720)).toBeNull();
    expect(scaledSize(640, 360, 1080)).toBeNull();
    expect(scaledSize(3840, 2160, 0)).toBeNull();
  });
});

describe('GIF: размер и кадры', () => {
  test('ширина — не больше исходной, высота по пропорциям', () => {
    expect(gifSize(1920, 1080, 480)).toEqual({ width: 480, height: 270 });
    expect(gifSize(1080, 1920, 320)).toEqual({ width: 320, height: 569 });
    expect(gifSize(320, 240, 480)).toEqual({ width: 320, height: 240 });
  });

  test('кадры с шагом 1/fps от первого; длинное видео — первые 20 с и пометка «обрезано»', () => {
    expect(gifTimestamps(0, 2, 10).timestamps).toHaveLength(20);
    expect(gifTimestamps(0.5, 1, 10).timestamps.slice(0, 2)).toEqual([0.5, 0.6]);
    expect(gifTimestamps(0, 2, 10).trimmed).toBe(false);
    const long = gifTimestamps(0, 95, 15);
    expect(long.timestamps).toHaveLength(GIF_MAX_SECONDS * 15);
    expect(long.trimmed).toBe(true);
    // очень короткое видео — хотя бы один кадр
    expect(gifTimestamps(0, 0.01, 10).timestamps).toEqual([0]);
  });
});
