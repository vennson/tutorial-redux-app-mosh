import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { addBug, resolveBug, loadBugs, getUnresolvedBugs } from '../bugs'
import configureStore from '../configureStore'

const url = '/bugs'

describe('bugSlice', () => {
  let mock
  let store

  beforeEach(() => {
    mock = new MockAdapter(axios)
    store = configureStore()
  })

  const bugsSlice = () => store.getState().entities.bugs
  const createState = () => ({
    entities: {
      bugs: {
        list: [],
      }
    }
  })

  it('should add bug to store if saved in server', async () => {
    const bug = { description: 'a' }
    const savedBug = { ...bug, id: 1 }
    mock.onPost(url).reply(200, savedBug)
    
    await store.dispatch(addBug(bug))

    expect(bugsSlice().list).toContainEqual(savedBug)
  })

  it('should not add bug to store if not saved in server', async () => {
    const bug = { description: 'a' }
    mock.onPost(url).reply(500)
    
    await store.dispatch(addBug(bug))

    expect(bugsSlice().list).toHaveLength(0)
  })

  describe('loading bugs', () => {
    describe('if bugs exist in cache', () => {
      it('should not be fetched from the server again', async () => {
        mock.onGet(url).reply(200, [{ id: 1 }])

        await store.dispatch(loadBugs())
        await store.dispatch(loadBugs())

        expect(mock.history.get).toHaveLength(1)
      })
    })
    describe('if bugs dont exist in cache', () => {
      it('should be fetched from the server and put in store', async () => {
        mock.onGet(url).reply(200, [{ id: 1 }])

        await store.dispatch(loadBugs())

        expect(bugsSlice().list).toHaveLength(1)
      })

      describe('loading indicator', () => {
        it('should be true while fetching bugs', () => {
          mock.onGet(url).reply(() => {
            expect(bugsSlice().loading).toBe(true)
            return [200, { id: 1 }]
          }) 

          store.dispatch(loadBugs())
        })

        it('should be false after bugs are fetched', async () => {
          mock.onGet(url).reply([200, { id: 1 }]) 
          
          await store.dispatch(loadBugs())

          expect(bugsSlice().loading).toBe(false)
        })

        it('should be false if fetching bugs failed', async () => {
          mock.onGet(url).reply([500]) 
          
          await store.dispatch(loadBugs())

          expect(bugsSlice().loading).toBe(false)
        })
      })
    })
  })

  it('should mark bug as resolved if saved in server', async () => {
    mock.onPost(url).reply(200, { id: 1 })
    mock.onPatch(url + '/1').reply(200, { id: 1, resolved: true })
    
    await store.dispatch(addBug({}))
    await store.dispatch(resolveBug(1))

    expect(bugsSlice().list[0].resolved).toBe(true)
  })

  it('should not mark bug as resolved if not saved in server', async () => {
    mock.onPost(url).reply(200, { id: 1 })
    mock.onPatch(url + '/1').reply(500, { id: 1})
    
    await store.dispatch(addBug({}))
    await store.dispatch(resolveBug(1))

    expect(bugsSlice().list[0].resolved).not.toBe(true)
  })

  // it('should load bugs in store from server', async () => {
  //   const bug = { description: 'a' }
  //   const savedBug = { ...bug, id: 1 }
  //   mock.onGet(url).reply(200)
    
  //   await store.dispatch(loadBugs())
    
  //   expect(bugsSlice().list).toHaveLength(1)
  // })

  describe('selectors', () => {
    it('getUnresolvedBugs', async () => {
      const state = createState()
      state.entities.bugs.list = [{ id: 1, resolved: true }, { id: 2}, { id: 3 }]

      const result = getUnresolvedBugs(state)

      expect(result).toHaveLength(2)
    })
  })
})
