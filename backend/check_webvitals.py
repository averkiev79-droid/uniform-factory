from database_sqlite import get_db, WebVitals

db = next(get_db())
count = db.query(WebVitals).count()
print(f'Метрик Web Vitals в базе: {count}')

if count > 0:
    metrics = db.query(WebVitals).limit(5).all()
    print('\nПоследние метрики:')
    for m in metrics:
        print(f'- {m.name}: {m.value} ({m.rating}) - {m.page}')
else:
    print('\n⚠️ Метрики не записываются!')
