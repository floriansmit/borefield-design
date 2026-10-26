"""Compare interpolated browser kernels with direct pygfunction responses."""
import json, runpy, numpy as np, pygfunction as gt
make_kernel=runpy.run_path('public/kernel.py')['make_kernel']
p={'engine':'pyg-ubwt','radius':.075,'spacing':8,'years':25,'peakHours':6}
for engine in ['pyg-ubwt','pyg-uhtr']:
 p['engine']=engine
 k=make_kernel({'p':p,'n':2,'h':180,'k':2.24,'cv':2.73e6})
 t=np.arange(1,301)*365.25*86400/12
 field=[gt.boreholes.Borehole(180,1,.075,0,0),gt.boreholes.Borehole(180,1,.075,8,0)]
 exact=gt.gfunction.gFunction(field,2.24/2.73e6,t,method='similarities',boundary_condition='UBWT' if engine.endswith('ubwt') else 'UHTR',options={'nSegments':8,'disp':False}).gFunc/(2*np.pi*2.24)
 interp=np.interp(np.log(t),np.log(k['times']),k['response'])
 error=float(np.max(np.abs(interp-exact)/exact))
 assert error<.002, error
 print(engine,'maximum monthly response interpolation relative error:',round(error,6))
 assert k['response'][-1]>k['response'][0]>0
