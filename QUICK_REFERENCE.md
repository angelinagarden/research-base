# Быстрая памятка: Добавление исследований в Notion

## 🚀 Быстрый старт

1. **Скопировать шаблон**: `cp research-template.cjs add-[название]-[год].cjs`
2. **Заполнить данные** в `researchData`
3. **Запустить**: `node add-[название]-[год].cjs`
4. **Проверить**: исследование появилось в веб-интерфейсе

## ⚠️ Критические ограничения

- **DetailedContent** ≤ 2000 символов
- **CentralInsight** ≤ 2000 символов
- **DatePublished** формат: YYYY-MM-DD
- **VolumePages** всегда строка или null

## 🔧 Типичные ошибки

| Ошибка | Решение |
|--------|---------|
| DetailedContent > 2000 символов | Сократить контент |
| TitleOriginal validation failed | Проверить формат: `{ title: [{ text: { content: "..." } }] }` |
| VolumePages is expected to be rich_text | Конвертировать в строку: `researchData.volumePages.toString()` |

## 📋 Чек-лист

- [ ] Все поля заполнены
- [ ] DetailedContent ≤ 2000 символов
- [ ] CentralInsight ≤ 2000 символов
- [ ] Дата в формате YYYY-MM-DD
- [ ] URL валидный
- [ ] Теги в массиве
- [ ] Скрипт запущен
- [ ] Ошибок нет
- [ ] Исследование в веб-интерфейсе

## 🎯 Команды для проверки

```bash
# Проверить добавление
curl -s http://localhost:3001/api/notion/query -X POST -H "Content-Type: application/json" -d '{"filter":{"property":"TitleOriginal","title":{"contains":"[название]"}}}' | jq '.results[] | {title: .properties.TitleOriginal.title[0].text.content, id: .id}'

# Общее количество исследований
curl -s http://localhost:3001/api/notion/query -X POST -H "Content-Type: application/json" -d '{}' | jq '.results | length'
```

## 📁 Файлы

- `RESEARCH_ADDITION_GUIDE.md` - полная инструкция
- `research-template.cjs` - шаблон скрипта
- `QUICK_REFERENCE.md` - эта памятка


