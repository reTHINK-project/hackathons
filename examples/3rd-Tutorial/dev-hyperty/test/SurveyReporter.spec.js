import { expect } from 'chai'
import activate from '../src/survey/SurveyReporter.hy.js'
import { syncherFactory, hypertyDiscoveryFactory } from './stubs'

describe('Survey Reporter', ()=>{
    describe('create', ()=>{
        it('should create a survey', (done)=>{
            activate.__Rewire__('Syncher', syncherFactory(()=>{}))
            activate.__Rewire__('HypertyDiscovery', hypertyDiscoveryFactory('SurveyObserver'))
            let survey = {}            
            let participants =[{email: '', domain: ''}]
            let reporter =  activate('http://test.com',{},{})

            reporter.instance.create(survey, participants)
                .then((survey)=>{
                    expect(survey).not.be.null
                    done()
                })
        })
    })

    describe('results', ()=>{
        it('should return the results', (done)=>{
            let callback
            let setCallback = (c)=>callback = c
            activate.__Rewire__('Syncher', syncherFactory(setCallback))
            activate.__Rewire__('HypertyDiscovery', hypertyDiscoveryFactory('SurveyObserver'))
            let survey = {}            
            let participants =[{email: '', domain: ''}]
            let reporter =  activate('http://test.com',{},{})

            reporter.instance.create(survey, participants)
                .then((survey)=>{
                    callback({value:{response:{}}})
                    expect(survey.results.length).to.be.equal(1)
                    done()
                })
        })
    })
})
