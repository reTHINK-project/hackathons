# Survey hyperty

## 1. Survey hyperty functionality description.
Survey hyperty provide a mechanism to send surveys and to receive the results

##1.1 Data-schema used.
It uses the Communication Data schema so it is compatible with any hyperty using the same data schema.

##2. Exposed API. 

###2.1 SurveyReporter

####create
To create a survey

#####Syntax
    create (survey, participants)

#####Params
*survey*

 Survey configuration in a plain text format `{"title":"Tell us, what technologies do you use?","pages":[{"name":"page1","questions":[{"type":"radiogroup","choices":["Yes","No"],"isRequired":true,"name":"frameworkUsing","title":"Do you use any front-end framework like Bootstrap?"}]}`

*participants*

 Participants Collection `[{email:"email@test.com", domain:"domain"}, ...]`

#####Returned Value
Returns a object to ask for survey results. This property resturns a collection of result in a text plain format.

    [{"frameworkUsing":"Yes","framework":["Bootstrap"],"mvvmUsing":"Yes","mvvm":["KnockoutJS"],"about":"aaaa"}, ...]
    
#####How to use it.
    surveyHy.create(JSON.stringify('{pages:[{name:"page1",questions:[{type:"checkbox",choices:["one",{value:"two",text:"second value"},{value:"three",text:"third value"}],name:"question1"}]}]}'), [{email:'email@test.com', domain: 'domain'}, ...])
        .then((survey)=>{
           //survey.results 
        })

###2.2 SurveyObserver

####onRequest
Call a callback function when receives a survey request with a survey object.

#####Syntax
    onRequest (callback)

#####Params
*callback*

 Callback function to call when a survey request is received. It should accept a survey object.

#####Survey object
 A survey request returns a survey object. This contains the survey data and provides a way to answer the survey.

    survey.data // survey configuration
    survey.answer(answer) // to answer the survey, it expects a answeer in plain text format

#####How to use it.
`surveyHy.onRequest(processRequest)`

##3. Framework improvement proposals derived from Hyperty Survey development.

*Problems with the Communication schema [9](https://github.com/reTHINK-project/dev-hyperty-toolkit/issues/9#issuecomment-225280592)
*Code to get Hyperties per user repeated in many hyperties [29](https://github.com/reTHINK-project/dev-hyperty/issues/29)
