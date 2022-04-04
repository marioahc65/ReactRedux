import axios from 'axios';
import { updateDB, getFavs } from '../firebase';

//constans
let initialData = {
    fetching: false,
    array: [],
    current: {},
    favorites: [],
}
let URL = "https://rickandmortyapi.com/api/character"

let GET_CHARACTERS = "GET_CHARACTERS"
let GET_CHARACTERS_SUCCESS = "GET_CHARACTERS_SUCCESS"
let GET_CHARACTERS_ERROR = "GET_CHARACTERS_ERROR"
let REMOVE_CHARACTER = "REMOVE_CHARACTER"
let ADD_TO_FAVORITES = "ADD_TO_FAVORITES"

let GET_FAV = "GET_FAV"
let GET_FAV_SUCCESS = "GET_FAV_SUCCESS"
let GET_FAV_ERROR = "GET_FAV_ERROR"

//reducer
export default function reducer(state = initialData, action) {
    switch (action.type) {
        case GET_FAV_ERROR:
            return { ...state, fetching: false, error: action.payload }
        case GET_FAV:
            return { ...state, fetching: true }
        case GET_FAV_SUCCESS:
            return { ...state, fetching: false, favorites: action.payload }
        case ADD_TO_FAVORITES:
            return { ...state, ...action.payload }
        case REMOVE_CHARACTER:
            return { ...state, array: action.payload }
        case GET_CHARACTERS:
            return { ...state, fetching: true }
        case GET_CHARACTERS_ERROR:
            return { ...state, fetching: false, error: action.payload }
        case GET_CHARACTERS_SUCCESS:
            return { ...state, array: action.payload, fetching: false }
        default:
            return state;
    }
}
// aux

function saveStorage(storage){
    localStorage.storage = JSON.stringify(storage);
}

//actions (thunk)

export let restoreFavAction = () => dispatch => {
    let storage = localStorage.getItem('storage');
    storage = JSON.parse(storage);
    if(storage && storage.characters.favorites) {
        dispatch({
            type: GET_FAV_SUCCESS,
            payload: storage.characters.favorites
        })
    }
}

export let retreiveFavs = () => (dispatch, getState) => {
    dispatch({
        type: GET_FAV
    })
    let {uid} = getState().user;
    return getFavs(uid)
    .then(array => {
        dispatch({
            type: GET_FAV_SUCCESS,
            payload: [...array]
        })
    })
    .catch(e=>{
        console.log(e)
        dispatch({
            type: GET_FAV_ERROR,
            payload: e.message
        })
    })


}

export let addToFavoriteAction = () => (dispatch, getState) => {
    let { array, favorites } = getState().characters;
    let { uid } = getState().user;
    let char = array.shift();
    favorites.push(char);
    updateDB(favorites, uid )
    dispatch({
        type: ADD_TO_FAVORITES,
        payload: { favorites:[...favorites], array:[...array] }
    })
    saveStorage(getState())
}

export let removeCharacterAction = () => (dispatch, getState) => {
    let { array } = getState().characters
    array.shift()
    dispatch({
        type: REMOVE_CHARACTER,
        payload: [...array]
    })
}

export let getCharacterAction = () => (dispatch, getState) => {
    dispatch({ type: GET_CHARACTERS })
    return axios.get(URL)
        .then(res => {
            dispatch({
                type: GET_CHARACTERS_SUCCESS,
                payload: res.data.results
            })
            restoreFavAction()(dispatch)
        })
        .catch(err => {
            dispatch({
                type: GET_CHARACTERS_ERROR,
                payload: err.response.message
            })
        })
}

