import { expect } from 'chai'
import { Position, Area } from '../src/group-chat/gps'

describe('gps', ()=>{
    describe('Position', ()=>{
        describe('initialize', ()=>{
            it('should return 0/0 Position from empty or undefined array', ()=>{
                let position = Position({})
                expect(position.latitude).to.equal(0)
                expect(position.longitude).to.equal(0)
            })

            it('should return 0/0 Position from wrong type', ()=>{
                let position = Position({values:{}})
                expect(position.latitude).to.equal(0)
                expect(position.longitude).to.equal(0)
            })
            
            it('should return a Position from array representation', ()=>{
                let position = Position({values:[{name: 'latitude', value: 40}, { name: 'longitude', value: 50}]})
                expect(position.latitude).to.equal(40)
                expect(position.longitude).to.equal(50)
            })
        })

        describe('isIn', ()=>{
            it('should return true if position  A is inside the area described by position B', ()=>{
                let positionA = Position({values:[{name: 'latitude', value: 42.5954857}, { name: 'longitude', value: -8.7645436}]})
                let positionB = Position({values:[{name: 'latitude', value: 42.595571}, { name: 'longitude', value: -8.764544}]})

                expect(positionA.isIn(Area(positionB, 0.1))).to.be.true
            })

            it('should return true if radius is zero', ()=>{
                let positionA = Position({values:[]})
                let positionB = Position({values:[]})

                expect(positionA.isIn(Area(positionB, undefined))).to.be.true
            })
        })
    })

    describe('Area', ()=>{
        describe('initialize', ()=>{
            it('should return a Area from a position and a distance in kilometers', ()=>{
                let area = Area(Position({values:[{name: 'latitude', value: 40}, { name: 'longitude', value: 50}]}),2)
                expect(area.radius).to.equal(2)
            })
        }) 
    })
})
