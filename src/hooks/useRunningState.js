import {useReducer, useCallback} from "react";

const initialState = {
    running: false
};

const reducer = (state, action) => {
    switch(action.type) {
        case "abort":
        case "complete":
            return initialState;
        case "setSteps":
            return { running: true, current: 0, max: action.payload };
        case "increment":
            return {...state, current: action.payload };
    }
};

export default function useRunningState() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const actions = {
        abort: useCallback(() => dispatch({ type: "abort" }), [dispatch]),
        complete: useCallback(() => dispatch({ type: "abort" }), [dispatch]),
        setSteps: useCallback(payload => dispatch({ type: "setSteps", payload }), [dispatch]),
        increment: useCallback(payload => dispatch({ type: "increment", payload }), [dispatch])
    };
    return [state, actions];
}