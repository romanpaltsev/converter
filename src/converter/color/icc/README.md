# Встраиваемые ICC-профили

Используются, когда цвет исходного HEIC задан не ICC-профилем, а параметрами nclx
(или не задан вовсе): пиксели не пересчитываются, в результат встраивается
эквивалентный профиль.

| Файл | Цветовое пространство |
|---|---|
| `sRGB-v2-magic.icc` | sRGB |
| `DisplayP3Compat-v2-magic.icc` | Display P3 (вариант с нулевым Z красного — для строгих читателей ICC) |
| `Rec2020Compat-v2-magic.icc` | Rec. 2020 |

Источник: [saucecontrol/Compact-ICC-Profiles](https://github.com/saucecontrol/Compact-ICC-Profiles),
лицензия CC0 1.0 (общественное достояние).
