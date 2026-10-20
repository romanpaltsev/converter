// Видео (mediabunny + WebCodecs): MOV в MP4 без перекодирования, WebM в MP4 (H.264 + AAC), уменьшение кадра,
// MP4 в WebM, видео в GIF (размер, кадры, частота). Строго — в Chromium; Firefox на Linux без ffmpeg не декодирует
// H.264 и AAC, WebKit GTK в Docker ведёт себя непостоянно — там допустима понятная ошибка в строке вместо результата.
import type { Locator } from '@playwright/test';
import { SETTLED_ROWS, convertFiles, downloadFile, expect, fileRow, openConverter, pickTarget, test } from './fixtures';
import { fixture, gifInfo, mediaInfo } from './files';

const menu = (page: import('@playwright/test').Page) => page.locator('[data-picker]');
/** Ошибки, которыми браузер без нужного кодека честно завершает строку. */
const CODEC_ERRORS = /кодек не поддерживается|не умеет сохранять|перестал отвечать/;

/** В Chromium файл обязан сконвертироваться; в других браузерах — либо готов, либо понятная ошибка про кодек. */
async function settledOrUnsupported(row: Locator, strict: boolean): Promise<boolean> {
  if (!strict && (await row.getAttribute('data-status')) === 'error') {
    await expect(row).toContainText(CODEC_ERRORS);
    return false;
  }
  await expect(row).toHaveAttribute('data-status', 'done');
  return true;
}

test.describe('видео', () => {
  test.setTimeout(180_000);

  test('MOV в MP4: H.264 и AAC перепаковываются без перекодирования; настройки качества и размера кадра', async ({ page }) => {
    await openConverter(page, '/mov-v-mp4');
    const settings = page.locator('[data-settings]');
    await expect(settings.locator('[data-video-row]')).toBeVisible();
    await expect(settings.locator('[data-quality-row]')).toBeHidden();
    await expect(settings.locator('[data-meta-row]')).toBeHidden();
    await expect(settings.getByRole('radio', { name: 'Высокое' })).toBeChecked();
    await expect(settings.getByRole('radio', { name: 'Исходный' })).toBeChecked();

    await convertFiles(page, ['clip.mov']);
    const row = fileRow(page, 'clip.mp4');
    await expect(row).toContainText('без перекодирования');
    await expect(row).toContainText('0:02');
    const info = await mediaInfo(await downloadFile(page, 'clip.mp4'));
    expect(info).toMatchObject({ mime: 'video/mp4', videoCodec: 'avc', codec: 'aac', width: 320, height: 240 });
    expect(Math.abs(info.duration - 2)).toBeLessThan(0.1);
  });

  test('WebM в MP4: перекодирование в H.264 и AAC', async ({ page, browserName }) => {
    await openConverter(page, '/webm-v-mp4');
    await convertFiles(page, ['clip.webm']);
    const row = page.locator('.file').first();
    if (!(await settledOrUnsupported(row, browserName === 'chromium'))) return;
    await expect(row).not.toContainText('без перекодирования');
    const info = await mediaInfo(await downloadFile(page, 'clip.mp4'));
    expect(info).toMatchObject({ mime: 'video/mp4', width: 320, height: 240 });
    // H.264, если браузер его кодирует (Chromium — да); иначе запасной кодек
    expect(browserName === 'chromium' ? ['avc'] : ['avc', 'hevc', 'vp9', 'av1']).toContain(info.videoCodec);
    expect(info.codec).toBe('aac');
  });

  test('MP4 в WebM: 480p уменьшает кадр по короткой стороне (1280×720 → 854×480), VP9 и Opus', async ({ page, browserName }) => {
    await openConverter(page, '/mp4-v-webm');
    await page.locator('[data-settings]').getByRole('radio', { name: '480p' }).check();
    await convertFiles(page, ['hd.mp4']);
    const row = page.locator('.file').first();
    if (!(await settledOrUnsupported(row, browserName === 'chromium'))) return;
    const info = await mediaInfo(await downloadFile(page, 'hd.webm'));
    expect(info).toMatchObject({ mime: 'video/webm', width: 854, height: 480, codec: 'opus' });
    expect(['vp9', 'vp8', 'av1']).toContain(info.videoCodec);
  });

  test('MP4 в GIF: 10 кадров в секунду, ширина не больше исходной, повтор; 15 к/с — «Конвертировать заново»', async ({ page, browserName }) => {
    await openConverter(page, '/mp4-v-gif');
    const settings = page.locator('[data-settings]');
    await expect(settings.locator('[data-gif-row]')).toBeVisible();
    await expect(settings.locator('[data-video-row]')).toBeHidden();
    await convertFiles(page, ['clip.mp4']);
    const row = page.locator('.file').first();
    if (!(await settledOrUnsupported(row, browserName === 'chromium'))) return;
    const gif = gifInfo(await downloadFile(page, 'clip.gif'));
    // клип 320×240 уже ширины по умолчанию (480) — размер прежний; 2 с × 10 к/с
    expect(gif).toEqual({ width: 320, height: 240, frames: 20, delay: 100, loops: true });

    await settings.getByRole('radio', { name: '15', exact: true }).check();
    await page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' }).click();
    await expect(page.locator('[data-status-text]')).toHaveText('Готово: 1 из 1.', { timeout: 120_000 });
    expect(gifInfo(await downloadFile(page, 'clip.gif'))).toMatchObject({ frames: 30, delay: 70 });
  });

  test('меню видеофайла: «Видео» (без своего формата) и «Аудио»; у MP3 видеоформатов нет', async ({ page }) => {
    await openConverter(page, '/');
    await page.setInputFiles('[data-input]', ['clip.mp4', 'tone.mp3'].map(fixture));
    await expect(page.locator('.file[data-status="waiting"]')).toHaveCount(2);
    await fileRow(page, 'clip.mp4').locator('[data-target-button]').click();
    await expect(menu(page).getByRole('menuitemradio')).toHaveText(['WebM', 'GIF', 'MP3', 'WAV', 'M4A', 'OGG', 'FLAC']);
    expect(await menu(page).getByRole('group').evaluateAll((groups) => groups.map((group) => group.getAttribute('aria-label')))).toEqual(['Видео', 'Аудио']);
    await page.keyboard.press('Escape');
    await fileRow(page, 'tone.mp3').locator('[data-target-button]').click();
    await expect(menu(page).getByRole('menuitemradio')).toHaveText(['WAV', 'M4A', 'OGG', 'FLAC']);
    await page.keyboard.press('Escape');
    // «Все файлы в GIF» — только видео; MP3 остаётся ждать
    await page.locator('[data-target-all]').click();
    await menu(page).getByRole('menuitemradio', { name: 'GIF', exact: true }).click();
    await expect(page.locator(SETTLED_ROWS)).toHaveCount(2, { timeout: 120_000 });
    await expect(fileRow(page, 'tone.mp3')).toHaveAttribute('data-status', 'waiting');
    await pickTarget(page, 'tone.mp3', 'WAV');
    await expect(fileRow(page, 'tone.wav')).toHaveAttribute('data-status', 'done', { timeout: 60_000 });
  });

  test('en: MOV to MP4', async ({ page }) => {
    await openConverter(page, '/en/mov-to-mp4');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('MOV to MP4 Converter');
    await convertFiles(page, ['clip.mov']);
    await expect(fileRow(page, 'clip.mp4')).toContainText('no re-encoding');
  });
});
