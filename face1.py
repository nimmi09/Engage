import json
def func(q):
    return json.dumps({'value': q})

   
    

while True:
    inp = input(" ")
    abc=json.loads(inp)
    print(func(abc))
   
    
    