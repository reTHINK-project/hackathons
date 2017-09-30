import { expect } from 'chai'
import activate from '../src/survey/SurveyObserver.hy.js'
import { syncherFactory, hypertyDiscoveryFactory, notifications, identityFactory } from './stubs'



describe('Survey Observer', ()=>{
    beforeEach(function() {
        activate.__Rewire__('HypertyDiscovery', hypertyDiscoveryFactory('NotificationsObserver'))
        activate.__Rewire__('NotificationsTrigger', notifications)
        activate.__Rewire__('IdentityManager', identityFactory())
    })

    describe('onRequest', ()=>{
        it('should receive a survey', (done)=>{
            let callback
            let setCallback = (c)=>callback = c

            activate.__Rewire__('Syncher', syncherFactory(setCallback, {data:{name:''}}))
            let observer = activate('http://test.com', {}, {})
            observer.instance.onRequest((survey)=>{
                expect(survey).to.exist
                done()
            })
            callback({schema: 'hyperty-catalogue://catalogue.test.com/.well-known/dataschema/Communication'})
        })

        it('should launch a notification', (done)=>{
            let callback
            let setCallback = (c)=>callback = c
            activate.__Rewire__('Syncher', syncherFactory(setCallback, {data:{name:''}}))
            let observer = activate('http://test.com', {}, {})
            observer.instance.onRequest(()=>{})
            notifications.prototype.callback = ()=> done()
            callback({schema: 'hyperty-catalogue://catalogue.test.com/.well-known/dataschema/Communication'})
        })
    })
})

describe('Survey', ()=>{
    describe('answer', ()=>{
        it('it should send the answer', (done)=>{
            let callback
            let dataObject = { addChild:()=>done() , data:{name:''}}
            let syncher = syncherFactory((c)=>callback = c, dataObject)
            activate.__Rewire__('Syncher', syncher)
            let observer = activate('http://test.com', {}, {})
            
            observer.instance.onRequest((survey)=>{
                survey.answer({}) 
            })
            callback({schema: 'hyperty-catalogue://catalogue.test.com/.well-known/dataschema/Communication'})
        })
    })
})

