import runpy, math, json
f=runpy.run_path('public/kernel.py')['make_pipe']
c=dict(flow=.25,rho=1030,cp=3900,mu=.004,fluidK=.45,groutK=1.5,pipeK=.4,pumpEfficiency=.45,pumpHours=3000,headerKPa=20,roughness=1.5e-6,uInner=26,uOuter=32,uSpacing=60,coaxInnerID=32,coaxInnerOD=40,coaxOuterID=79,coaxOuterOD=90,coaxInnerK=.4,coaxOuterK=.4,uPrice=6,doublePrice=10,coaxPrice=18)
def run(kind,**changes):return f(dict(p=dict(radius=.075,pipeDesign={**c,**changes}),h=180,k=2.24,kind=kind))
u,co=run('single-u'),run('coaxial')
assert u['rb']>0 and co['rb']>0 and abs(u['rb']-co['rb'])>.001
assert run('coaxial',coaxInnerK=.05)['rb']<co['rb']
lam=run('single-u',flow=.05)
expected=2*180*8*c['mu']*(.05/c['rho'])/(math.pi*(.026/2)**4)+20000
assert abs(lam['pressureKPa']*1000-expected)<1e-8
assert abs(u['pumpKWhPerBorehole']-u['pressureKPa']*1000*.25/1030/.45*3000/1000)<1e-9
assert run('double-u')['pressureKPa']<u['pressureKPa']
try:run('coaxial',coaxOuterID=30)
except ValueError:pass
else:raise AssertionError('Invalid coaxial geometry accepted')
with open('/tmp/borefield-pipe-fixture.json','w') as file:json.dump(dict(u=u,coax=co),file)
print('Pipe effective resistance, coaxial insulation sensitivity, exact laminar pressure, pump energy and geometry checks passed.')
