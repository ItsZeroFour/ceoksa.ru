import { lazy } from "react";

const RELOAD_FLAG = "chunk-failed-reload";
const RELOAD_WINDOW_MS = 15000;

/**
 * Обёртка над React.lazy. Если динамический импорт чанка падает
 * (старый index.html ссылается на удалённые после деплоя файлы),
 * страница один раз перезагружается, чтобы браузер забрал свежий index.html.
 * Повторная перезагрузка в течение RELOAD_WINDOW_MS не делается — это
 * защищает от бесконечного цикла при настоящей ошибке загрузки.
 */
const lazyWithRetry = (importFn) =>
  lazy(async () => {
    try {
      const component = await importFn();
      window.sessionStorage.removeItem(RELOAD_FLAG);
      return component;
    } catch (error) {
      const lastReload = Number(
        window.sessionStorage.getItem(RELOAD_FLAG) || 0
      );
      const now = Date.now();

      if (now - lastReload > RELOAD_WINDOW_MS) {
        window.sessionStorage.setItem(RELOAD_FLAG, String(now));
        window.location.reload();
        // Возвращаем «зависший» промис, чтобы Suspense держал fallback
        // до момента фактической перезагрузки страницы.
        return new Promise(() => {});
      }

      throw error;
    }
  });

export default lazyWithRetry;
