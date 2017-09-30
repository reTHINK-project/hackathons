import sinon from 'sinon'
import { expect } from 'chai'
import NotificationsTrigger from '../src/notifications/notifications-trigger'

describe('Notifications Trigger', ()=>{
    describe('trigger notification', ()=>{
        it('should trigger a new chat notification to recipients', ()=>{
            let reporter = {}
            reporter.addChild = sinon.spy()

            let syncher = {}
            syncher.create = sinon.stub().returns(Promise.resolve(reporter))

            let discovery = {}
            discovery.discoverHypertiesPerUser = sinon.stub().returns(Promise.resolve({'hypertyURL':{descriptor:'Notifications'}}))

            const notifications = NotificationsTrigger('test.com', syncher, discovery)
            
            notifications.trigger([{email: 'test@test.com', domain: 'test.com'}], {type: 'NEW_CHAT', payload:{name: 'New Chat'}})
                .then(()=>{
                    expect(reporter.addChild.calledOnce).to.be.true
                })
        })
    })

    //reuse reporter
})
