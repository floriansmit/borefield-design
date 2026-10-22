"""Borefield Explorer: actual pygfunction 2.3.1 finite-line-source kernels.
MIT wrapper; pygfunction retains its own BSD-3-Clause licence.
"""
import json
import numpy as np
import pygfunction as gt

def make_kernel(request):
    p, n, h = request['p'], request['n'], request['h']
    k, cv = request['k'], request['cv']
    width = int(np.ceil(np.sqrt(n)))
    field = [gt.boreholes.Borehole(h, 1.0, p['radius'],
             (i % width)*p['spacing'], (i // width)*p['spacing']) for i in range(n)]
    # Exactly include the peak duration and a logarithmic grid for long-term interpolation.
    times = np.unique(np.r_[p['peakHours']*3600,
            np.geomspace(min(3600, p['peakHours']*3600),
                        p['years']*365.25*86400, 96)])
    boundary = 'UBWT' if p['engine'] == 'pyg-ubwt' else 'UHTR'
    g = gt.gfunction.gFunction(field, k/cv, time=times,
            method='similarities', boundary_condition=boundary,
            options={'nSegments':8, 'disp':False})
    return {'times':times.tolist(), 'response':(g.gFunc/(2*np.pi*k)).tolist(),
            'package':'pygfunction 2.3.1', 'boundary':boundary, 'segments':8,
            'buriedDepth':1.0}


def make_pipe(request):
    """Effective resistance from pygfunction pipe models, plus circuit friction.
    Constant user-supplied bulk fluid properties; one parallel circuit per borehole.
    Coaxial flow: down the inner pipe, back up the outer annulus.
    """
    import math
    p, h, ks = request['p'], request['h'], request['k']
    c, kind = p['pipeDesign'], request['kind']
    positive = ['flow','rho','cp','mu','fluidK','groutK','pipeK','pumpEfficiency','pumpHours']
    if any(not np.isfinite(c[key]) or c[key] <= 0 for key in positive):
        raise ValueError('Positive flow, fluid, grout, pipe and pump properties are required.')
    if c['pumpEfficiency'] > 1 or c['pumpHours'] > 8784 or c['headerKPa'] < 0 or c['roughness'] < 0:
        raise ValueError('Check pump efficiency, operating hours, roughness and header pressure.')
    m, rho, cp, mu, kf = [c[k] for k in ['flow','rho','cp','mu','fluidK']]
    eps=c['roughness']
    borehole=gt.boreholes.Borehole(h,1,p['radius'],0,0)
    def circular(ri, ro, conductivity, mass=m):
        hc=gt.pipes.convective_heat_transfer_coefficient_circular_pipe(mass,ri,mu,rho,kf,cp,eps)
        resistance=gt.pipes.conduction_thermal_resistance_circular_pipe(ri,ro,conductivity)+1/(hc*2*np.pi*ri)
        return resistance
    def pressure(ri, ro=None, mass=m):
        # Darcy friction; exact fully developed annulus Poiseuille laminar solution.
        area=np.pi*ri**2 if ro is None else np.pi*(ro**2-ri**2)
        diameter=2*ri if ro is None else 2*(ro-ri)
        velocity=mass/rho/area
        re=rho*velocity*diameter/mu
        turbulent=(-1.8*np.log10((eps/diameter/3.7)**1.11+6.9/max(re,1)))**-2*rho*velocity**2/(2*diameter)
        if ro is None:
            laminar=8*mu*(mass/rho)/(np.pi*ri**4)
        else:
            shape=ro**4-ri**4-(ro**2-ri**2)**2/np.log(ro/ri)
            laminar=8*mu*(mass/rho)/(np.pi*shape)
        mix=np.clip((re-2300)/1700,0,1)
        return float(laminar*(1-mix)+turbulent*mix),float(re)
    if kind in ['single-u','double-u']:
        ri,ro=c['uInner']/2000,c['uOuter']/2000
        spacing=c['uSpacing']/1000
        if not 0 < ri < ro or spacing <= 2*ro or spacing/2+ro>=p['radius']:
            raise ValueError('U-tube pipes must have positive wall thickness, not overlap and fit inside the borehole.')
        double=kind=='double-u'
        if double and spacing/np.sqrt(2)<=2*ro:
            raise ValueError('Double-U pipe centres overlap; increase spacing or borehole diameter.')
        branch=m/2 if double else m
        Rfp=circular(ri,ro,c['pipeK'],branch)
        if double:
            a=spacing/2
            tube=gt.pipes.MultipleUTube([(-a,0),(0,-a),(a,0),(0,a)],ri,ro,borehole,ks,c['groutK'],Rfp,2,config='parallel')
        else:
            tube=gt.pipes.SingleUTube([(-spacing/2,0),(spacing/2,0)],ri,ro,borehole,ks,c['groutK'],Rfp)
        gradient,re=pressure(ri,mass=branch)
        dp=2*h*gradient+c['headerKPa']*1000
        reynolds=[re,re]
        price=c['doublePrice'] if double else c['uPrice']
    elif kind=='coaxial':
        ri,ro=np.array([c['coaxInnerID'],c['coaxOuterID']])/2000,np.array([c['coaxInnerOD'],c['coaxOuterOD']])/2000
        if not 0<ri[0]<ro[0]<ri[1]<ro[1]<p['radius']:
            raise ValueError('Coaxial diameters must be ordered inner ID < inner OD < outer ID < outer OD < borehole diameter.')
        hi,ho=gt.pipes.convective_heat_transfer_coefficient_concentric_annulus(m,ro[0],ri[1],mu,rho,kf,cp,eps)
        # Fluid-to-fluid path = inner convection + inner wall + annulus inner convection.
        Rff=circular(ri[0],ro[0],c['coaxInnerK'])+1/(hi*2*np.pi*ro[0])
        Rfp=gt.pipes.conduction_thermal_resistance_circular_pipe(ri[1],ro[1],c['coaxOuterK'])+1/(ho*2*np.pi*ri[1])
        tube=gt.pipes.Coaxial((0,0),ri,ro,borehole,ks,c['groutK'],Rff,Rfp)
        inner,rei=pressure(ri[0]);annulus,rea=pressure(ro[0],ri[1])
        dp=h*(inner+annulus)+c['headerKPa']*1000
        reynolds=[rei,rea]
        price=c['coaxPrice']
    else:
        raise ValueError('Unsupported exchanger geometry.')
    if not np.isfinite(price) or price<0:
        raise ValueError('Loop installation price must be nonnegative.')
    resistance=float(tube.effective_borehole_thermal_resistance(m,cp))
    pump_w=dp*(m/rho)/c['pumpEfficiency']
    if not np.isfinite(resistance) or resistance<=0:
        raise ValueError('Calculated borehole resistance is invalid.')
    return {'type':kind,'rb':resistance,'pressureKPa':float(dp/1000),
            'pumpWattsPerBorehole':float(pump_w),
            'pumpKWhPerBorehole':float(pump_w*c['pumpHours']/1000),
            'reynolds':reynolds,'massFlowPerBorehole':m,'cp':cp,
            'loopCostPerMetre':price,'method':'pygfunction 2.3.1 effective pipe resistance; constant fluid properties',
            'flowDirection':'Inner down / annulus up' if kind=='coaxial' else 'U-loop down / up'}
