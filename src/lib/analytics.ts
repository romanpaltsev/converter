// Заглушка аналитики. Сейчас ничего не отправляет и не загружает никаких сторонних скриптов.
// Позже здесь будет вызов целей Яндекс.Метрики (после юридического оформления).

export type AnalyticsEvent = 'conversion_complete';

export function track(event: AnalyticsEvent, params: Record<string, string | number> = {}): void {
  void event;
  void params;
}
