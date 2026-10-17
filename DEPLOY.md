# DEPLOY.md — деплой на VDS

Схема: GitHub (`main`) → GitHub Actions (сборка и все тесты) → по SSH на VDS: `git pull` и
`docker compose up -d --build`. В контейнере nginx раздаёт собранный сайт на `127.0.0.1:8090`,
снаружи его проксирует nginx хоста с HTTPS (Certbot).

```
браузер ──HTTPS──▶ nginx хоста (Certbot) ──HTTP──▶ 127.0.0.1:8090 ──▶ контейнер nginx ──▶ dist/
```

Пока в репозитории не заданы секреты `VDS_*`, workflow выполняет все проверки, а шаг деплоя
пропускает с пометкой «Деплой пропущен» — на сервере ничего не происходит.

## Первичная настройка сервера

Нужны: Docker с плагином `docker compose`, git, nginx, Certbot (`python3-certbot-nginx`).

1. **DNS.** A-запись (и AAAA, если есть IPv6) `converter.hotbar.pro` → IP сервера.

2. **Пользователь для деплоя.** Можно отдельного, например `deploy`, с доступом к Docker:
   ```bash
   sudo adduser --disabled-password deploy
   sudo usermod -aG docker deploy
   ```

3. **Ключ для GitHub Actions** (на своём компьютере, без пароля):
   ```bash
   ssh-keygen -t ed25519 -f converter_deploy -C "github-actions converter" -N ""
   ```
   Публичную часть (`converter_deploy.pub`) — на сервер, в `/home/deploy/.ssh/authorized_keys`.
   Приватную (`converter_deploy`) — в секрет `VDS_SSH_KEY` (шаг 8), после этого локальную копию можно удалить.

4. **Код.** Репозиторий публичный, ключ для чтения не нужен:
   ```bash
   sudo mkdir -p /opt/converter && sudo chown deploy:deploy /opt/converter
   sudo -u deploy git clone https://github.com/romanpaltsev/converter.git /opt/converter
   ```

5. **Переменные.** В папке проекта:
   ```bash
   cd /opt/converter
   sudo -u deploy cp .env.example .env    # при необходимости поправьте значения (таблица ниже)
   ```

6. **Первый запуск контейнера:**
   ```bash
   sudo -u deploy docker compose up -d --build
   curl -I http://127.0.0.1:8090/    # 200, есть Content-Security-Policy и X-Robots-Tag: noindex, nofollow
   ```

7. **nginx хоста и HTTPS.** Пример готового блока — `deploy/converter.hotbar.pro.conf`.
   До получения сертификата включите только HTTP-часть, чтобы Certbot прошёл проверку:
   ```bash
   sudo cp deploy/converter.hotbar.pro.conf /etc/nginx/sites-available/converter.hotbar.pro.conf
   # временно закомментируйте весь второй server { listen 443 … } в этом файле
   sudo ln -s /etc/nginx/sites-available/converter.hotbar.pro.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot certonly --webroot -w /var/www/html -d converter.hotbar.pro
   # раскомментируйте блок 443 (пути к сертификату в нём уже правильные)
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Продление сертификата Certbot настраивает сам (`systemctl list-timers | grep certbot`).
   Если nginx старше 1.25.1, вместо `http2 on;` используйте `listen 443 ssl http2;`.

   Закрыть тестовую площадку паролем можно строками `auth_basic` в блоке 443 (в примере закомментированы).

8. **Секреты GitHub** — Settings → Secrets and variables → Actions → New repository secret:

   | Секрет | Значение |
   |---|---|
   | `VDS_HOST` | IP или имя сервера |
   | `VDS_USER` | пользователь для деплоя (`deploy`) |
   | `VDS_SSH_KEY` | приватный ключ из шага 3 целиком, вместе со строками BEGIN/END |
   | `VDS_PATH` | папка проекта на сервере (`/opt/converter`) |
   | `VDS_PORT` | необязательно: порт SSH, если не 22 |
   | `VDS_KNOWN_HOSTS` | необязательно, но надёжнее: вывод `ssh-keyscan -H <хост>` (иначе ключ хоста берётся при каждом деплое) |

9. **Проверка деплоя.** Actions → «CI и деплой» → Run workflow (ветка `main`) или любой push в `main`.
   Деплой выполняет на сервере ровно это:
   ```bash
   cd "$VDS_PATH" && git pull --ff-only && docker compose up -d --build && docker image prune -f
   ```
   `docker image prune -f` удаляет только «висящие» слои старых сборок, чтобы не копились на диске.

## Переменные окружения

Задаются в `.env` рядом с `docker-compose.yml` (пример — `.env.example`). Значения встраиваются в сайт
**при сборке образа**, поэтому после изменения нужна пересборка: `docker compose up -d --build`.

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `SITE_URL` | `https://converter.hotbar.pro` | адрес сайта: canonical, hreflang, sitemap, ссылка на sitemap в robots.txt |
| `PUBLIC_INDEXING` | `false` | `false`: robots.txt с `Disallow: /`, `noindex, nofollow` в каждой странице и заголовок `X-Robots-Tag`. `true`: обычный robots.txt со ссылкой на sitemap |
| `ADS_ENABLED` | `false` | места под рекламные блоки (пока пустые) |
| `PRO_ENABLED` | `false` | место под кнопку Pro |
| `HOST_PORT` | `8090` | порт контейнера на `127.0.0.1` сервера (должен совпадать с `proxy_pass`) |

## Переезд на финальный домен

1. DNS нового домена → IP сервера.
2. В `/opt/converter/.env`: `SITE_URL=https://новый-домен`, когда сайт готов к поиску — `PUBLIC_INDEXING=true`.
3. Пересобрать: `docker compose up -d --build`.
4. Новый server-блок: скопируйте `deploy/converter.hotbar.pro.conf`, замените имя домена в `server_name`
   и путях к сертификату, включите и получите сертификат (как в шаге 7):
   `sudo certbot certonly --webroot -w /var/www/html -d новый-домен -d www.новый-домен`.
5. Старый тестовый домен — либо отключить, либо перенаправить на новый
   (`return 301 https://новый-домен$request_uri;` в его блоке 443).
6. В Яндекс.Вебмастере и Google Search Console добавить сайт и отправить `https://новый-домен/sitemap-index.xml`.

## Обслуживание

- Логи: `docker compose logs -f` (в папке проекта).
- Откат: `git log --oneline` → `git checkout <коммит> && docker compose up -d --build`;
  чтобы автодеплой снова работал, верните ветку: `git checkout main` (или сделайте `git revert` и push).
- Состояние контейнера: `docker compose ps` (есть healthcheck).
- Версии: Node в `Dockerfile` и `.nvmrc` (сейчас 24 LTS; Node 26 станет LTS 28.10.2026 — замена одной строки
  в обоих файлах), nginx — `nginx:1.30-alpine` (стабильная ветка, патчи подтягиваются при пересборке).
