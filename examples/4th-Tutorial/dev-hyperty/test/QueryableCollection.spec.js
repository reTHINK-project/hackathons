import { expect } from 'chai'
import newQueryableCollection from '../src/discovery/QueryableCollection'

describe('QueryableCollection', ()=>{

    let connected_users

    beforeEach(()=>{
        connected_users = newQueryableCollection()
    })

    describe('add an object', ()=> {
        it('should add the object to the collection', ()=>{
            connected_users = connected_users.add({id:100, name:'name'})

            expect(connected_users.query().length).to.be.equal(1)
        })

        it('shouldnt add the object if it exists in the collection', ()=> {
            connected_users = connected_users.add({id:100, name:'name'})
            connected_users = connected_users.add({id:100, name:'name'})

            expect(connected_users.query().length).to.be.equal(1)
        })
    })

    describe('query', ()=>{
        describe('getting all the users', ()=>{
            it('should return every object if no filters are passed in', () => {
                connected_users = connected_users.add({id:100, name:'name'})
                connected_users = connected_users.add({id:101, name:'name'})

                expect(connected_users.query().length).to.be.equal(2)
            })
        })

        describe('filtering object using searchjs filters https://github.com/deitch/searchjs', () => {
            it('should filter collection if some any filter is passed in', ()=> {
                connected_users = connected_users.add({id:100, name:'name'})
                connected_users = connected_users.add({id:101, name:'name'})

                expect(connected_users.query({id: 101}).length).to.be.equal(1)
            })
        })
    })
})
