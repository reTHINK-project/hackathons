import sinon from 'sinon'
import { expect } from 'chai'
import activate from '../src/notifications/NotificationsObserver.hy.js'
import { syncherFactory } from './stubs'

describe('Notification Observer', ()=>{
    describe('onNotification', ()=>{
        it('should receive notifications', (done)=>{
            let callback
            let setCallback = (c)=>callback = c
            activate.__Rewire__('Syncher', syncherFactory(setCallback))
            let observer =  activate('http://test.com',{},{})
            
            observer.instance.onNotification((notification)=>{
                done()
            })
            callback({schema: 'hyperty-catalogue://catalogue.test.com/.well-known/dataschema/Communication'})
        })
    })
})

