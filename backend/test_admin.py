import urllib.request, json

# Login as admin
data = json.dumps({'email': 'nayandg8@gmail.com', 'password': 'admin@123'}).encode()
req = urllib.request.Request('http://127.0.0.1:5000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as f:
    r = json.loads(f.read())
    token = r['accessToken']
    print('Admin login OK, role=' + r['user']['role'])

def get(path):
    req = urllib.request.Request('http://127.0.0.1:5000/api' + path, headers={'Authorization': 'Bearer ' + token})
    with urllib.request.urlopen(req) as f:
        return json.loads(f.read())

# API Keys
keys = get('/admin/api-keys')
print('\nAPI Keys: ' + str(len(keys)) + ' total')
for k in keys:
    print('  ' + k['provider'] + ' | ' + k['label'] + ' | active=' + str(k['isActive']) + ' | status=' + k['status'])

# AI Configs
configs = get('/admin/ai-configs')
print('\nAI Configs: ' + str(len(configs)))
for c in configs:
    print('  ' + c['task'] + ' -> ' + c['primaryProvider'] + '/' + c['primaryModel'])

# Health
health = get('/admin/health/providers')
print('\nHealth: aiService=' + health['aiService'])
for p, info in health['providers'].items():
    print('  ' + p + ': ' + str(info['healthyKeys']) + '/' + str(info['totalActiveKeys']) + ' healthy, status=' + info['status'])
