# CRM-система управления самокатами и арендами

## Архитектура и Стек
- **Backend**: Express.js + TypeScript + TypeORM + Socket.io (WebSocket для real-time обновлений).
- **Frontend**: Vue 3 (Composition API) + TypeScript + Pinia + Leaflet (карта).
- **База данных**: PostgreSQL.
- **Инфраструктура**: Docker Compose.

### Почему выбран этот стек?
- **Express + TypeScript**: Гарантирует строгую типизацию, высокую производительность и гибкость при настройке WebSocket.
- **Vue 3 + Pinia**: Оптимален для создания реактивных интерфейсов CRM с минимальным объемом boilerplate-кода.
- **TypeORM**: Упрощает работу с PostgreSQL и обеспечение целостности связей "Самокат-Аренда".

## Быстрый запуск

1. Убедитесь, что у вас установлен Docker и Docker Compose.
2. В корневой директории проекта выполните команду:

```bash
docker-compose up --build