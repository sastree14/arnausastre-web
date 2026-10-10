"""Deterministic editorial ordering and Madrid-local dates, including DST changes."""
import json
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'growth/data'
FOUNDATIONS = ['P001','P002','P004','P003','P009','P005','P012','P007','P015','P010','P051','P006']
TIMELY = ['P025','P037','P041']
TEST_ID = 'P148'  # Six images exercise the complete collection, with no automatic date.


def pillar(post):
    title = post['title'].lower()
    rules = [
        ('Gobernanza de IA', ('data act','efti','pasaporte','legal','usos de ia','uso de ia','control de ia','proveedor de ia','riesgo de ia','software puede contener')),
        ('Colaboración y proyectos', ('partner','colaboración','especialidad','especialización','departamento','encargo','primera conversación','cuéntanos','apoyo recurrente','dos capacidades','entregable conjunto','recomendar esperar')),
        ('Automatización y agentes', ('agente','automatiz','workflow','copilot','autonomía','api','recepcionista','permiso para pagar','escalar')),
        ('Forecasting y machine learning', ('forecast','previsión','previsiones','predicción','predicci','modelo','scoring','visión por computador','demanda','ausencia','abandono','fraude')),
        ('Optimización operativa', ('optimiza','restricci','planificador','aps','stock','surtido','pedido','reposición','máquina','capacidad','redistribuir','transferencia','flete','transporte')),
        ('Finanzas y escenarios', ('financ','tesorería','capital','caja','margen','precio','cobro','liquidación','riesgo','due diligence','simula','presupuesto','inversión','viabilidad')),
        ('Datos y arquitectura', ('arquitectura','dato','fuente','crm','erp','integración','carga','componente','documenta')),
    ]
    for label, words in rules:
        if any(word in title for word in words):
            return label
    return 'Decisiones y visualización'


def build(posts):
    lookup = {p['content_id']: p for p in posts}
    start = FOUNDATIONS[:]
    remaining = [p for p in posts if p['content_id'] not in start and p['content_id'] != TEST_ID]
    buckets = {}
    for p in remaining:
        buckets.setdefault(pillar(p), deque()).append(p['content_id'])
    order = start[:]
    while any(buckets.values()):
        for label, values in buckets.items():
            if values:
                order.append(values.popleft())
    # Put the explicitly regulatory topics early, interleaved with business examples.
    for content_id, position in zip(TIMELY, [13, 17, 21]):
        order.remove(content_id)
        order.insert(position, content_id)
    day = datetime(2026, 10, 14, tzinfo=ZoneInfo('Europe/Madrid'))
    slots = {0: 16, 2: 16, 4: 15}
    output = []
    for index, content_id in enumerate(order, 1):
        while day.weekday() not in slots or (day.month, day.day) in {(12,25),(1,1)}:
            day += timedelta(days=1)
        post = lookup[content_id]
        when = day.replace(hour=slots[day.weekday()])
        output.append({'content_id': content_id, 'order': index, 'title': post['title'],
                       'pillar': pillar(post), 'scheduled_at': when.isoformat(),
                       'timezone': 'Europe/Madrid', 'images': len(post['slides']), 'test_reserved': False})
        day += timedelta(days=1)
    test = lookup[TEST_ID]
    output.append({'content_id': TEST_ID, 'order': None, 'title': test['title'], 'pillar': pillar(test),
                   'scheduled_at': None, 'timezone': 'Europe/Madrid', 'images': len(test['slides']), 'test_reserved': True})
    return output


if __name__ == '__main__':
    posts = json.loads((DATA/'editorial-approved-manifest.json').read_text())
    result = build(posts)
    (DATA/'editorial-calendar.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'scheduled':len(result)-1,'test':TEST_ID,'first':result[0]['scheduled_at'],
                      'last':result[-2]['scheduled_at']},ensure_ascii=False))
