import urllib.request, json

# Login
data = json.dumps({'email': 'nayandg8@gmail.com', 'password': 'admin@123'}).encode()
req = urllib.request.Request('http://127.0.0.1:5000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as f:
    token = json.loads(f.read())['accessToken']

def post(path, body=b'{}'):
    req = urllib.request.Request(
        'http://127.0.0.1:5000/api' + path,
        data=body,
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as f:
            return json.loads(f.read()), None
    except Exception as e:
        err = e.read().decode()[:400] if hasattr(e, 'read') else str(e)
        return None, err

print('Testing all 3 AI endpoints...\n')

# Skills
print('[1] Skills Analyze')
d, e = post('/ai/skills/analyze')
if e:
    print('  FAIL:', e)
else:
    p = d.get('profile', {})
    cats = p.get('categories', [])
    mastery = p.get('masteryItems', [])
    gaps = p.get('gapAnalysis', [])
    trending = p.get('trendingSkills', [])
    print('  OK! categories=' + str(len(cats)) + ' mastery=' + str(len(mastery)) + ' gaps=' + str(len(gaps)) + ' trending=' + str(len(trending)))
    if cats:
        print('      first: ' + str(cats[0].get('name')) + ' @ ' + str(cats[0].get('score')) + '%')

# Roadmap
print()
print('[2] Roadmap Generate')
d, e = post('/ai/roadmap', json.dumps({'targetRoles': ['Senior Backend Engineer']}).encode())
if e:
    print('  FAIL:', e)
else:
    m = d.get('milestones', [])
    readiness = d.get('readiness', 0)
    print('  OK! ' + str(len(m)) + ' milestones, readiness=' + str(readiness) + '%')
    if m:
        first = m[0]
        print('      first: ' + str(first.get('title')) + ' [' + str(first.get('status')) + '] ' + str(len(first.get('subtasks', []))) + ' subtasks')

# Companies
print()
print('[3] Company Match')
d, e = post('/ai/companies')
if e:
    print('  FAIL:', e)
else:
    matches = d.get('matches', [])
    print('  OK! ' + str(len(matches)) + ' companies')
    for c in matches[:3]:
        print('      ' + str(c.get('name')) + ' ' + str(c.get('matchScore')) + '% - ' + str(c.get('tier', '')))
