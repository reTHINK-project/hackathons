export function syncherFactory (setCallback,
        dataObject = {onAddChild:(callback)=>{callback({})}}){
    let syncher = function (){} 
    syncher.prototype.onNotification = (callback)=>{ 
        setCallback(callback)
    } 
    syncher.prototype.subscribe = ()=>Promise.resolve(dataObject)
    syncher.prototype.create = ()=>Promise.resolve({
        onSubscription: ()=>{},
        onAddChild:(callback)=>{setCallback(callback)}
    })

    return syncher
}

export function hypertyDiscoveryFactory (descriptor){
    let hypertyDiscovery = function (){}
    hypertyDiscovery.prototype.discoverHypertiesPerUser = () => {
        return Promise.resolve({'runtimeURL':{ descriptor: descriptor, lastModified: Date.now()}})
    }

    return hypertyDiscovery
}

export function notifications(){ 
    return { trigger: ()=>{
        if(notifications.prototype.callback) 
            notifications.prototype.callback()
    }}
}

export function identityFactory(){
    let identity = function(){}
    identity.prototype.discoverUserRegistered = ()=>Promise.resolve({username:''})

    return identity
}
