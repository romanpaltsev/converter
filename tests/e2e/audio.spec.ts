// Аудио (mediabunny + WebCodecs, MP3 — LAME, FLAC и AAC — WASM-расширения, если браузер их не кодирует):
// страницы «… в MP3», звук из видео, все форматы на выходе, копирование без перекодирования, ошибки.
import { SETTLED_ROWS, convertFiles, downloadFile, expect, fileRow, openConverter, pickTarget, test } from './fixtures';
import { fixture, mediaInfo } from './files';

const menu = (page: import('@playwright/test').Page) => page.locator('[data-picker]');

test.describe('аудио', () => {
  test('WAV в MP3: 192 кбит/с по умолчанию, стерео 44,1 кГц, теги сохраняются; 320 кбит/с — «Конвертировать заново»', async ({ page }) => {
    await openConverter(page, '/wav-v-mp3');
    const settings = page.locator('[data-settings]');
    await expect(settings.locator('[data-audio-bitrate-row]')).toBeVisible();
    await expect(settings.locator('[data-quality-row]')).toBeHidden();
    await expect(settings.locator('[data-meta-row]')).toBeHidden();
    await expect(settings.getByRole('radio', { name: '192' })).toBeChecked();

    await convertFiles(page, ['tone.wav']);
    const row = fileRow(page, 'tone.mp3');
    await expect(row).toContainText('0:03');
    await expect(row.locator('.file__thumb')).toHaveText('MP3');
    const mp3 = await downloadFile(page, 'tone.mp3');
    const info = await mediaInfo(mp3);
    expect(info).toMatchObject({ mime: 'audio/mpeg', codec: 'mp3', channels: 2, sampleRate: 44100, hasVideo: false, title: 'Test tone', artist: 'Synthetic' });
    expect(Math.abs(info.duration - 3)).toBeLessThan(0.1);
    // 192 кбит/с × 3 с ≈ 72 КБ
    expect(mp3.length).toBeGreaterThan(60_000);
    expect(mp3.length).toBeLessThan(85_000);

    await settings.getByRole('radio', { name: '320' }).check();
    await page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' }).click();
    await expect(page.locator('[data-status-text]')).toHaveText('Готово: 1 из 1.', { timeout: 60_000 });
    const better = await downloadFile(page, 'tone.mp3');
    expect(better.length).toBeGreaterThan(110_000);
  });

  test('MP4 в MP3: звук из MP4, WebM и MOV; видео без звука — понятная ошибка', async ({ page, browserName }) => {
    await openConverter(page, '/mp4-v-mp3');
    await convertFiles(page, ['clip.mp4', 'clip.webm', 'clip.mov', 'silent.mp4']);
    await expect(fileRow(page, 'silent.mp4')).toContainText('В файле нет звуковой дорожки.');
    // AAC (MP4, MOV) декодирует WebCodecs браузера; у Firefox на Linux без системного ffmpeg (как в тестах) его нет —
    // тогда в строке понятная ошибка про кодек; Opus из WebM читают все
    const rows = page.locator('.file');
    for (const index of [0, 2]) {
      if ((await rows.nth(index).getAttribute('data-status')) === 'error') await expect(rows.nth(index)).toContainText('кодек не поддерживается');
    }
    const converted = (await page.locator('.file[data-status="done"] .file__name').allTextContents()).filter((name) => name.endsWith('.mp3'));
    expect(converted).toContain('clip_2.mp3');
    if (browserName === 'chromium') expect(converted).toEqual(['clip.mp3', 'clip_2.mp3', 'clip_3.mp3']);
    for (const name of converted) {
      const info = await mediaInfo(await downloadFile(page, name));
      expect(info).toMatchObject({ mime: 'audio/mpeg', codec: 'mp3', hasVideo: false });
      expect(Math.abs(info.duration - 2)).toBeLessThan(0.1);
    }
  });

  test('все форматы на выходе: WAV, FLAC, M4A, OGG — кодеки, частота и теги', async ({ page, browserName }) => {
    // WebKit в Docker (GTK + GStreamer) заявляет декодеры Vorbis, Opus и FLAC и кодировщик AAC, но они бывает зависают —
    // тогда строку завершает сторож (45 с без хода), поэтому ждём дольше
    test.setTimeout(240_000);
    await openConverter(page, '/');
    await page.setInputFiles('[data-input]', ['tone.mp3', 'tone.ogg', 'tone.opus', 'tone.flac'].map(fixture));
    await expect(page.locator('.file[data-status="waiting"]')).toHaveCount(4);
    // у аудио в меню — только аудиоформаты, без своего
    await fileRow(page, 'tone.mp3').locator('[data-target-button]').click();
    await expect(menu(page).getByRole('menuitemradio')).toHaveText(['WAV', 'M4A', 'OGG', 'FLAC']);
    await page.keyboard.press('Escape');

    // строки — по номеру: имя результата одной строки совпадает с именем исходника другой (tone.ogg → tone.flac)
    const targets = ['WAV', 'FLAC', 'M4A', 'OGG'] as const;
    for (const [index, label] of targets.entries()) {
      await page.locator('.file').nth(index).locator('[data-target-button]').click();
      await menu(page).getByRole('menuitemradio', { name: label, exact: true }).click();
    }
    await expect(page.locator(SETTLED_ROWS)).toHaveCount(4, { timeout: 150_000 });

    const expected = {
      WAV: { name: 'tone.wav', info: { mime: 'audio/wav', codec: 'pcm-s16', channels: 2, sampleRate: 44100 } },
      FLAC: { name: 'tone.flac', info: { mime: 'audio/flac', codec: 'flac', channels: 2, title: 'Test tone', artist: 'Synthetic' } },
      M4A: { name: 'tone.m4a', info: { mime: 'audio/mp4', codec: 'aac', channels: 2, hasVideo: false, title: 'Test tone' } },
      OGG: { name: 'tone.ogg', info: { mime: 'audio/ogg', codec: 'opus', channels: 2, title: 'Test tone' } },
    } as const;
    for (const [index, label] of targets.entries()) {
      const row = page.locator('.file').nth(index);
      // WebKit в Docker — не Safari: его кодеки GStreamer ведут себя от запуска к запуску по-разному; здесь важно,
      // что строка завершилась (ошибкой, а не вечным «Конвертируется…»)
      if (browserName === 'webkit' && (await row.getAttribute('data-status')) === 'error') continue;
      await expect(row).toHaveAttribute('data-status', 'done');
      const info = await mediaInfo(await downloadFile(page, expected[label].name));
      expect(info).toMatchObject(expected[label].info);
      // кодировщики добавляют задержку и дополняют последний кадр — десятки миллисекунд
      expect(Math.abs(info.duration - 3)).toBeLessThan(0.1);
    }
  });

  test('тот же кодек — без перекодирования: AAC в M4A, Opus из WebM в OGG', async ({ page }) => {
    await openConverter(page, '/');
    await page.setInputFiles('[data-input]', ['tone.aac', 'clip.webm'].map(fixture));
    await pickTarget(page, 'tone.aac', 'M4A');
    await pickTarget(page, 'clip.webm', 'OGG');
    await expect(page.locator(SETTLED_ROWS)).toHaveCount(2, { timeout: 60_000 });
    await expect(fileRow(page, 'tone.m4a')).toContainText('без перекодирования');
    await expect(fileRow(page, 'clip.ogg')).toContainText('без перекодирования');
    const m4a = await downloadFile(page, 'tone.m4a');
    // поток AAC 128 кбит/с переложен как есть: размер почти как у исходного файла (49 КБ), а не 192 кбит/с (72 КБ)
    expect(m4a.length).toBeLessThan(56_000);
    expect(await mediaInfo(m4a)).toMatchObject({ codec: 'aac', mime: 'audio/mp4' });
    const ogg = await mediaInfo(await downloadFile(page, 'clip.ogg'));
    expect(ogg).toMatchObject({ codec: 'opus', hasVideo: false });
  });

  test('битый MP3 — ошибка в строке, остальные файлы идут дальше', async ({ page }) => {
    await openConverter(page, '/mp3-v-wav');
    await convertFiles(page, ['garbage.mp3', 'tone.mp3']);
    await expect(fileRow(page, 'garbage.mp3')).toHaveAttribute('data-status', 'error');
    await expect(fileRow(page, 'tone.wav')).toHaveAttribute('data-status', 'done');
  });

  test('en: MP3 to WAV', async ({ page }) => {
    await openConverter(page, '/en/mp3-to-wav');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('MP3 to WAV Converter');
    await convertFiles(page, ['tone.mp3']);
    await expect(fileRow(page, 'tone.wav')).toContainText('0:03');
    expect(await mediaInfo(await downloadFile(page, 'tone.wav'))).toMatchObject({ codec: 'pcm-s16', channels: 2 });
  });
});
